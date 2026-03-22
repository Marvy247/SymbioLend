// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SymbioLend
 * @notice P2P agent-to-agent lending protocol.
 *         Lender agents fund loans; borrower agents repay from on-chain revenue.
 *         Supports undercollateralized loans backed by credit scores.
 */
contract SymbioLend is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Types ───────────────────────────────────────────────────────────────

    enum LoanStatus { Pending, Active, Repaid, Defaulted, Liquidated }

    struct Agent {
        address wallet;
        uint256 creditScore;      // 0–1000; starts at 500
        uint256 totalBorrowed;
        uint256 totalRepaid;
        uint256 activeLoans;
        bool    registered;
    }

    struct Loan {
        uint256 id;
        address lender;
        address borrower;
        address token;
        uint256 principal;
        uint256 collateral;       // may be 0 for undercollateralized
        uint256 interestBps;      // basis points (e.g. 500 = 5%)
        uint256 dueAt;
        uint256 repaidAmount;
        LoanStatus status;
    }

    // ─── State ────────────────────────────────────────────────────────────────

    mapping(address => Agent)  public agents;
    mapping(uint256 => Loan)   public loans;
    mapping(address => bool)   public supportedTokens;

    uint256 public loanCount;
    uint256 public constant MAX_LOAN_DURATION = 30 days;
    uint256 public constant MIN_CREDIT_SCORE  = 200;
    uint256 public constant LIQUIDATION_BONUS = 500; // 5% bonus to liquidator

    address public owner;

    // ─── Events ───────────────────────────────────────────────────────────────

    event AgentRegistered(address indexed agent, uint256 creditScore);
    event LoanRequested(uint256 indexed loanId, address borrower, address token, uint256 principal, uint256 interestBps, uint256 duration);
    event LoanFunded(uint256 indexed loanId, address lender);
    event LoanRepaid(uint256 indexed loanId, uint256 amount, bool fullRepayment);
    event LoanDefaulted(uint256 indexed loanId, address borrower);
    event LoanLiquidated(uint256 indexed loanId, address liquidator);
    event CreditScoreUpdated(address indexed agent, uint256 oldScore, uint256 newScore);
    event TokenAdded(address indexed token);

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() { require(msg.sender == owner, "not owner"); _; }
    modifier onlyRegistered() { require(agents[msg.sender].registered, "not registered"); _; }

    // ─── Admin ────────────────────────────────────────────────────────────────

    function addToken(address token) external onlyOwner {
        supportedTokens[token] = true;
        emit TokenAdded(token);
    }

    // ─── Agent Registration ───────────────────────────────────────────────────

    function registerAgent() external {
        require(!agents[msg.sender].registered, "already registered");
        agents[msg.sender] = Agent({
            wallet:       msg.sender,
            creditScore:  500,
            totalBorrowed: 0,
            totalRepaid:  0,
            activeLoans:  0,
            registered:   true
        });
        emit AgentRegistered(msg.sender, 500);
    }

    // ─── Borrower: Request Loan ───────────────────────────────────────────────

    /**
     * @notice Borrower agent requests a loan. Optionally posts collateral.
     * @param token       ERC-20 token address (USDT, XAUT, etc.)
     * @param principal   Amount requested
     * @param interestBps Interest in basis points
     * @param duration    Loan duration in seconds (max 30 days)
     * @param collateral  Collateral amount (can be 0 for undercollateralized)
     */
    function requestLoan(
        address token,
        uint256 principal,
        uint256 interestBps,
        uint256 duration,
        uint256 collateral
    ) external nonReentrant onlyRegistered returns (uint256 loanId) {
        require(supportedTokens[token], "token not supported");
        require(principal > 0, "zero principal");
        require(duration > 0 && duration <= MAX_LOAN_DURATION, "bad duration");
        require(agents[msg.sender].creditScore >= MIN_CREDIT_SCORE, "credit too low");
        require(agents[msg.sender].activeLoans < 3, "too many active loans");

        if (collateral > 0) {
            IERC20(token).safeTransferFrom(msg.sender, address(this), collateral);
        }

        loanId = loanCount++;
        loans[loanId] = Loan({
            id:           loanId,
            lender:       address(0),
            borrower:     msg.sender,
            token:        token,
            principal:    principal,
            collateral:   collateral,
            interestBps:  interestBps,
            dueAt:        0,
            repaidAmount: 0,
            status:       LoanStatus.Pending
        });

        emit LoanRequested(loanId, msg.sender, token, principal, interestBps, duration);
    }

    // ─── Lender: Fund Loan ────────────────────────────────────────────────────

    function fundLoan(uint256 loanId, uint256 duration) external nonReentrant onlyRegistered {
        Loan storage loan = loans[loanId];
        require(loan.status == LoanStatus.Pending, "not pending");
        require(loan.borrower != msg.sender, "self-lending");
        require(duration > 0 && duration <= MAX_LOAN_DURATION, "bad duration");

        loan.lender = msg.sender;
        loan.dueAt  = block.timestamp + duration;
        loan.status = LoanStatus.Active;
        agents[loan.borrower].activeLoans++;

        IERC20(loan.token).safeTransferFrom(msg.sender, loan.borrower, loan.principal);

        emit LoanFunded(loanId, msg.sender);
    }

    // ─── Borrower: Repay ──────────────────────────────────────────────────────

    function repay(uint256 loanId, uint256 amount) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.status == LoanStatus.Active, "not active");
        require(msg.sender == loan.borrower, "not borrower");
        require(amount > 0, "zero amount");

        uint256 owed   = _totalOwed(loan);
        uint256 paying = amount > owed - loan.repaidAmount
            ? owed - loan.repaidAmount
            : amount;

        IERC20(loan.token).safeTransferFrom(msg.sender, loan.lender, paying);
        loan.repaidAmount += paying;

        bool fullRepayment = loan.repaidAmount >= owed;
        if (fullRepayment) {
            loan.status = LoanStatus.Repaid;
            agents[loan.borrower].activeLoans--;
            agents[loan.borrower].totalRepaid += loan.principal;
            _updateCreditScore(loan.borrower, true, block.timestamp < loan.dueAt);
            // Return collateral
            if (loan.collateral > 0) {
                IERC20(loan.token).safeTransfer(loan.borrower, loan.collateral);
            }
        }

        agents[loan.borrower].totalBorrowed += loan.principal;
        emit LoanRepaid(loanId, paying, fullRepayment);
    }

    // ─── Liquidation ──────────────────────────────────────────────────────────

    function liquidate(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.status == LoanStatus.Active, "not active");
        require(block.timestamp > loan.dueAt, "not overdue");

        loan.status = LoanStatus.Liquidated;
        agents[loan.borrower].activeLoans--;
        _updateCreditScore(loan.borrower, false, false);

        // Collateral → lender; bonus → liquidator (if collateral covers it)
        if (loan.collateral > 0) {
            uint256 bonus   = (loan.collateral * LIQUIDATION_BONUS) / 10000;
            uint256 toLender = loan.collateral > bonus ? loan.collateral - bonus : loan.collateral;
            IERC20(loan.token).safeTransfer(loan.lender, toLender);
            if (bonus > 0 && loan.collateral > toLender) {
                IERC20(loan.token).safeTransfer(msg.sender, bonus);
            }
        }

        emit LoanLiquidated(loanId, msg.sender);
        emit LoanDefaulted(loanId, loan.borrower);
    }

    // ─── Mark Default (callable by lender after due) ──────────────────────────

    function markDefault(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        require(loan.status == LoanStatus.Active, "not active");
        require(msg.sender == loan.lender, "not lender");
        require(block.timestamp > loan.dueAt, "not overdue");

        loan.status = LoanStatus.Defaulted;
        agents[loan.borrower].activeLoans--;
        _updateCreditScore(loan.borrower, false, false);

        emit LoanDefaulted(loanId, loan.borrower);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function totalOwed(uint256 loanId) external view returns (uint256) {
        return _totalOwed(loans[loanId]);
    }

    function getAgent(address wallet) external view returns (Agent memory) {
        return agents[wallet];
    }

    function getLoan(uint256 loanId) external view returns (Loan memory) {
        return loans[loanId];
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    function _totalOwed(Loan storage loan) internal view returns (uint256) {
        return loan.principal + (loan.principal * loan.interestBps) / 10000;
    }

    function _updateCreditScore(address agent, bool repaid, bool onTime) internal {
        Agent storage a = agents[agent];
        uint256 old = a.creditScore;
        if (repaid && onTime)  a.creditScore = _clamp(a.creditScore + 50,  0, 1000);
        else if (repaid)       a.creditScore = _clamp(a.creditScore + 20,  0, 1000);
        else                   a.creditScore = _clamp(a.creditScore - 150, 0, 1000);
        emit CreditScoreUpdated(agent, old, a.creditScore);
    }

    function _clamp(uint256 v, uint256 lo, uint256 hi) internal pure returns (uint256) {
        if (v < lo) return lo;
        if (v > hi) return hi;
        return v;
    }
}

# Security Specification for Spendly

## Data Invariants
- An expense cannot exist without a valid category and a positive amount.
- An expense belongs strictly to the user who created it (`userId == request.auth.uid`).
- A budget limit must be a positive number.
- Users can only access (read/write) their own data.
- Profiling data (emails) must be protected.

## The Dirty Dozen Payloads (Rejection Targets)

1. **Anonymous Write**: Attempt to create an expense without being logged in.
2. **Identity Spoofing**: Logged in as User A, attempt to create an expense with `userId: "UserB"`.
3. **Cross-User Leak**: Logged in as User A, attempt to read `expenses/UserB_Expense_ID`.
4. **Negative Expense**: Attempt to create an expense with `amount: -100`.
5. **Missing Fields**: Attempt to create an expense without `category` or `date`.
6. **Shadow Update**: Attempt to update an expense by adding a `isVerified: true` field.
7. **Type Poisoning**: Attempt to set `amount` to a string `"hundred"`.
8. **Resource Poisoning**: Attempt to use a 2MB string as an expense ID.
9. **Budget Hijack**: Logged in as User A, attempt to update User B's budget.
10. **Admin Escalation**: Attempt to set `isAdmin: true` in user profile.
11. **Future Dating**: Attempt to set `createdAt` to a point in the future (beyond server time).
12. **Status Bypass**: (If any) Attempt to modify immutable fields like `createdAt` or `originalOwnerId`.

## Test Scenarios (Simplified)
- `create` expense: `amount > 0 && userId == request.auth.uid` -> ALLOW
- `update` expense: `incoming().userId == existing().userId && incoming().userId == request.auth.uid` -> ALLOW
- `delete` expense: `existing().userId == request.auth.uid` -> ALLOW
- `list` expenses: `resource.data.userId == request.auth.uid` -> ALLOW

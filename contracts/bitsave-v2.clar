;; -----------------------------------------------------------
;; BitSave: Bitcoin-powered STX savings vault
;; Author: Marcus David
;; Description: Users can lock STX for a chosen duration and earn reputation points.
;; -----------------------------------------------------------

(define-data-var admin principal tx-sender)

;; Each user's savings info
(define-map savings
  { user: principal }
  {
    amount: uint,
    unlock-height: uint,
    claimed: bool
  }
)

;; Reputation points for loyal savers
(define-map reputation
  { user: principal }
  {
    points: int
  }
)

;; Annual reward rate (e.g. 10 = 10%)
(define-data-var reward-rate uint u10)

;; Error codes
(define-constant ERR_NO_AMOUNT (err u100))
(define-constant ERR_ALREADY_DEPOSITED (err u101))
(define-constant ERR_ALREADY_WITHDRAWN (err u102))
(define-constant ERR_LOCK_ACTIVE (err u103))
(define-constant ERR_NO_DEPOSIT (err u104))
(define-constant ERR_NOT_AUTHORIZED (err u105))

;; -----------------------------------------------------------
;; Utility Functions
;; -----------------------------------------------------------

(define-private (is-admin (sender principal))
  (is-eq sender (var-get admin))
)

;; -----------------------------------------------------------
;; Core Contract Functions
;; -----------------------------------------------------------

(define-public (deposit (amount uint) (lock-period uint))
  (let
    (
      (existing (map-get? savings { user: tx-sender }))
    )
    (begin
      (asserts! (> amount u0) ERR_NO_AMOUNT)
      ;; Allow deposit if no existing deposit OR if previous deposit was already claimed
      (match existing
        prev-deposit (asserts! (get claimed prev-deposit) ERR_ALREADY_DEPOSITED)
        true  ;; No existing deposit, allow
      )
      (let ((unlock (+ stacks-block-height lock-period)))
        (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
        (map-set savings
          { user: tx-sender }
          {
            amount: amount,
            unlock-height: unlock,
            claimed: false
          }
        )
        (ok (tuple (amount amount) (unlock-block unlock)))
      )
    )
  )
)

(define-public (withdraw)
  (match (map-get? savings { user: tx-sender })
    user-data
    (let
      (
        (unlock (get unlock-height user-data))
        (amount (get amount user-data))
        (claimed (get claimed user-data))
      )
      (begin
        (asserts! (not claimed) ERR_ALREADY_WITHDRAWN)
        (asserts! (>= stacks-block-height unlock) ERR_LOCK_ACTIVE)
        (let
          (
            (rate (var-get reward-rate))
            (reward (/ (* (to-int amount) (to-int rate)) 100))
            (current-points (default-to 0 (get points (map-get? reputation { user: tx-sender }))))
          )
          ;; Update reputation points
          (map-set reputation
            { user: tx-sender }
            { points: (+ reward current-points) }
          )
          
          ;; Auto-mint badge if user reaches reputation threshold (1000 points)
          ;; This rewards loyal savers with an on-chain achievement NFT
          (if (>= (get-user-rep tx-sender) u1000)
            (let
              (
                ;; Create badge metadata with user's achievement tier
                (badge-metadata u"{\"name\":\"Loyal Saver\",\"tier\":\"gold\",\"threshold\":1000}")
              )
              ;; Attempt to mint badge (ignore errors if badge contract not set up)
              (match (contract-call? .bitsave-badges mint tx-sender badge-metadata)
                success true
                error true
              )
            )
            true
          )
          
          ;; Mark savings as claimed and transfer STX back to user
          (map-set savings { user: tx-sender } { amount: u0, unlock-height: unlock, claimed: true })
          (try! (as-contract (stx-transfer? amount tx-sender tx-sender)))
          (ok (tuple (withdrawn amount) (earned-points reward)))
        )
      )
    )
    ERR_NO_DEPOSIT
  )
)

(define-public (set-reward-rate (new-rate uint))
  (begin
    (asserts! (is-admin tx-sender) ERR_NOT_AUTHORIZED)
    (var-set reward-rate new-rate)
    (ok new-rate)
  )
)

(define-read-only (get-savings (user principal))
  (ok (map-get? savings { user: user }))
)

(define-read-only (get-reputation (user principal))
  (match (map-get? reputation { user: user })
    rep-data (ok (get points rep-data))
    (ok 0)
  )
)

;; Helper function to get user reputation points as uint
;; Used for badge threshold checks
(define-private (get-user-rep (user principal))
  (match (map-get? reputation { user: user })
    rep-data (to-uint (get points rep-data))
    u0
  )
)

(define-read-only (get-reward-rate)
  (ok (var-get reward-rate))
)

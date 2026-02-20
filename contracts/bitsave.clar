;; BitSave - Bitcoin-Powered STX Savings Vault
;; A decentralized savings protocol on Stacks

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-locked (err u102))
(define-constant err-invalid-amount (err u103))
(define-constant err-invalid-period (err u104))
(define-constant err-no-savings (err u105))

;; Data Variables
(define-data-var reward-rate uint u10) ;; 10% default

;; Data Maps
(define-map savings
  principal
  {
    amount: uint,
    lock-until: uint,
    deposited-at: uint
  }
)

(define-map reputation principal uint)

;; Read-only functions
(define-read-only (get-savings (user principal))
  (map-get? savings user)
)

(define-read-only (get-reputation (user principal))
  (default-to u0 (map-get? reputation user))
)

(define-read-only (get-reward-rate)
  (ok (var-get reward-rate))
)

(define-read-only (calculate-reward (amount uint))
  (/ (* amount (var-get reward-rate)) u100)
)

(define-read-only (get-total-return (user principal))
  (match (map-get? savings user)
    saving
    (let ((reward (calculate-reward (get amount saving))))
      (ok (+ (get amount saving) reward)))
    (err err-no-savings)
  )
)

;; Public functions
(define-public (deposit (amount uint) (lock-period uint))
  (let
    (
      (user tx-sender)
      (unlock-height (+ stacks-block-height lock-period))
    )
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (>= lock-period u144) err-invalid-period) ;; Min 1 day (144 blocks)
    (asserts! (is-none (map-get? savings user)) err-locked)
    
    (try! (stx-transfer? amount user (as-contract tx-sender)))
    
    (map-set savings user {
      amount: amount,
      lock-until: unlock-height,
      deposited-at: stacks-block-height
    })
    
    (ok true)
  )
)

(define-public (withdraw)
  (let
    (
      (user tx-sender)
      (saving (unwrap! (map-get? savings user) err-not-found))
    )
    (asserts! (>= stacks-block-height (get lock-until saving)) err-locked)
    
    (let
      (
        (amount (get amount saving))
        (reward (calculate-reward amount))
        (total (+ amount reward))
        (rep-earned reward)
      )
      (try! (as-contract (stx-transfer? total tx-sender user)))
      
      (map-delete savings user)
      (map-set reputation user (+ (get-reputation user) rep-earned))
      
      (ok {amount: amount, reward: reward, reputation: rep-earned})
    )
  )
)

(define-public (set-reward-rate (new-rate uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set reward-rate new-rate)
    (ok true)
  )
)

(define-public (emergency-withdraw)
  (let
    (
      (user tx-sender)
      (saving (unwrap! (map-get? savings user) err-not-found))
    )
    (try! (as-contract (stx-transfer? (get amount saving) tx-sender user)))
    (map-delete savings user)
    (ok true)
  )
)

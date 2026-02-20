;; -----------------------------------------------------------
;; BitSave Referral System
;; Author: Marcus David
;; Description: Referral tracking and rewards for BitSave
;; -----------------------------------------------------------

(define-data-var admin principal tx-sender)
(define-data-var referral-bonus-rate uint u5) ;; 5% bonus for referrals

;; Track referral relationships
(define-map referrals
  { referee: principal }
  { referrer: principal, timestamp: uint }
)

;; Track referral stats
(define-map referral-stats
  { referrer: principal }
  { 
    total-referrals: uint,
    total-bonus-earned: uint,
    active-referrals: uint
  }
)

;; Error codes
(define-constant ERR_NOT_AUTHORIZED (err u300))
(define-constant ERR_ALREADY_REFERRED (err u301))
(define-constant ERR_SELF_REFERRAL (err u302))

;; -----------------------------------------------------------
;; Core Functions
;; -----------------------------------------------------------

(define-public (register-referral (referrer principal))
  (let
    (
      (existing (map-get? referrals { referee: tx-sender }))
    )
    (begin
      (asserts! (is-none existing) ERR_ALREADY_REFERRED)
      (asserts! (not (is-eq tx-sender referrer)) ERR_SELF_REFERRAL)
      
      ;; Register referral relationship
      (map-set referrals
        { referee: tx-sender }
        { referrer: referrer, timestamp: stacks-block-height }
      )
      
      ;; Update referrer stats
      (let
        (
          (current-stats (default-to 
            { total-referrals: u0, total-bonus-earned: u0, active-referrals: u0 }
            (map-get? referral-stats { referrer: referrer })
          ))
        )
        (map-set referral-stats
          { referrer: referrer }
          {
            total-referrals: (+ (get total-referrals current-stats) u1),
            total-bonus-earned: (get total-bonus-earned current-stats),
            active-referrals: (+ (get active-referrals current-stats) u1)
          }
        )
      )
      
      (ok true)
    )
  )
)

(define-public (calculate-referral-bonus (amount uint))
  (let
    (
      (referral-info (map-get? referrals { referee: tx-sender }))
    )
    (match referral-info
      info (/ (* amount (var-get referral-bonus-rate)) u100)
      u0
    )
  )
)

;; -----------------------------------------------------------
;; Admin Functions
;; -----------------------------------------------------------

(define-public (set-referral-bonus-rate (new-rate uint))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) ERR_NOT_AUTHORIZED)
    (asserts! (<= new-rate u50) ERR_NOT_AUTHORIZED) ;; Max 50% bonus
    (var-set referral-bonus-rate new-rate)
    (ok new-rate)
  )
)

;; -----------------------------------------------------------
;; Read-only Functions
;; -----------------------------------------------------------

(define-read-only (get-referrer (referee principal))
  (match (map-get? referrals { referee: referee })
    info (ok (some (get referrer info)))
    (ok none)
  )
)

(define-read-only (get-referral-stats (referrer principal))
  (ok (map-get? referral-stats { referrer: referrer }))
)

(define-read-only (get-referral-bonus-rate)
  (ok (var-get referral-bonus-rate))
)

;; BitSave Math Utilities
;; Mathematical helper functions for the BitSave protocol

;; Calculate compound interest
(define-read-only (calculate-compound-interest (principal uint) (rate uint) (periods uint))
  (let ((rate-decimal (/ rate u100)))
    (if (is-eq periods u0)
      principal
      (* principal (pow (+ u100 rate-decimal) periods) (/ u1 (pow u100 periods)))
    )
  )
)

;; Calculate simple interest
(define-read-only (calculate-simple-interest (principal uint) (rate uint) (periods uint))
  (+ principal (* principal rate periods (/ u1 u10000)))
)

;; Calculate reputation points based on amount and lock period
(define-read-only (calculate-reputation-points (amount uint) (lock-period uint))
  (let ((base-points (/ amount u1000000))) ;; 1 point per STX
    (* base-points (+ u1 (/ lock-period u1440))) ;; Bonus for longer locks
  )
)

;; Calculate time-weighted average
(define-read-only (calculate-time-weighted-average (amounts (list 10 uint)) (weights (list 10 uint)))
  (let ((total-weighted (fold + (map * amounts weights) u0))
        (total-weights (fold + weights u0)))
    (if (> total-weights u0)
      (/ total-weighted total-weights)
      u0
    )
  )
)

;; Safe division with rounding
(define-read-only (safe-divide (numerator uint) (denominator uint))
  (if (> denominator u0)
    (/ (+ numerator (/ denominator u2)) denominator)
    u0
  )
)

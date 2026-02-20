;; BitSave Validation Utilities
;; Input validation and sanitization functions

;; Validate lock period is within acceptable range
(define-read-only (is-valid-lock-period (period uint))
  (and (>= period u144) (<= period u1051200))
)

;; Validate deposit amount meets minimum requirements
(define-read-only (is-valid-deposit-amount (amount uint))
  (>= amount u1000000)
)

;; Validate principal is not zero address
(define-read-only (is-valid-principal (user principal))
  (not (is-eq user 'SP000000000000000000002Q6VF78))
)

;; Validate reward rate is reasonable (0-100%)
(define-read-only (is-valid-reward-rate (rate uint))
  (and (>= rate u0) (<= rate u100))
)

;; Validate token ID exists and is positive
(define-read-only (is-valid-token-id (token-id uint))
  (> token-id u0)
)

;; Sanitize string input for metadata
(define-read-only (sanitize-string (input (string-ascii 256)))
  (if (> (len input) u0)
    input
    "")
)

;; Check if block height is in the future
(define-read-only (is-future-block (target-block uint))
  (> target-block block-height)
)

;; Validate percentage is between 0-100
(define-read-only (is-valid-percentage (percentage uint))
  (and (>= percentage u0) (<= percentage u100))
)

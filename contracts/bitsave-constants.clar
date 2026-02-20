;; BitSave Constants
;; Centralized constants for the BitSave protocol

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INVALID-AMOUNT (err u101))
(define-constant ERR-INVALID-LOCK-PERIOD (err u102))
(define-constant ERR-NO-SAVINGS (err u103))
(define-constant ERR-STILL-LOCKED (err u104))
(define-constant ERR-ALREADY-EXISTS (err u105))

;; Protocol constants
(define-constant MIN-LOCK-PERIOD u144) ;; ~1 day in blocks
(define-constant MAX-LOCK-PERIOD u1051200) ;; ~2 years in blocks
(define-constant MIN-DEPOSIT-AMOUNT u1000000) ;; 1 STX in microSTX
(define-constant BADGE-THRESHOLD u1000) ;; Reputation points needed for badge

;; Default values
(define-constant DEFAULT-REWARD-RATE u10) ;; 10% annual rate

;; -----------------------------------------------------------
;; BitSave Upgrade Manager
;; Author: Marcus David
;; Description: Manages contract upgrades and migrations
;; -----------------------------------------------------------

(define-data-var admin principal tx-sender)
(define-data-var upgrade-enabled bool false)
(define-data-var new-contract-address (optional principal) none)

;; Error codes
(define-constant ERR_NOT_AUTHORIZED (err u200))
(define-constant ERR_UPGRADE_NOT_ENABLED (err u201))
(define-constant ERR_NO_NEW_CONTRACT (err u202))

;; -----------------------------------------------------------
;; Admin Functions
;; -----------------------------------------------------------

(define-public (enable-upgrade (new-contract principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) ERR_NOT_AUTHORIZED)
    (var-set upgrade-enabled true)
    (var-set new-contract-address (some new-contract))
    (ok true)
  )
)

(define-public (disable-upgrade)
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) ERR_NOT_AUTHORIZED)
    (var-set upgrade-enabled false)
    (var-set new-contract-address none)
    (ok true)
  )
)

(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) ERR_NOT_AUTHORIZED)
    (var-set admin new-admin)
    (ok true)
  )
)

;; -----------------------------------------------------------
;; Read-only Functions
;; -----------------------------------------------------------

(define-read-only (is-upgrade-enabled)
  (ok (var-get upgrade-enabled))
)

(define-read-only (get-new-contract-address)
  (ok (var-get new-contract-address))
)

(define-read-only (get-admin)
  (ok (var-get admin))
)

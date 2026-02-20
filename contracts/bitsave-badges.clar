;; BitSave Badges - SIP-009 NFT Achievement System

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u200))
(define-constant err-not-authorized (err u201))
(define-constant err-not-found (err u202))

;; Data Variables
(define-data-var last-token-id uint u0)
(define-data-var authorized-minter (optional principal) none)

;; NFT Definition
(define-non-fungible-token bitsave-badge uint)

;; Data Maps
(define-map token-metadata uint {
  name: (string-ascii 50),
  tier: (string-ascii 20),
  threshold: uint
})

;; Read-only Functions
(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)

(define-read-only (get-token-uri (token-id uint))
  (ok (some "ipfs://bitsave-badges"))
)

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? bitsave-badge token-id))
)

(define-read-only (get-metadata (token-id uint))
  (map-get? token-metadata token-id)
)

(define-read-only (get-authorized-minter)
  (var-get authorized-minter)
)

;; Public Functions
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-authorized)
    (nft-transfer? bitsave-badge token-id sender recipient)
  )
)

(define-public (set-authorized-minter (minter principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set authorized-minter (some minter))
    (ok true)
  )
)

(define-public (mint (recipient principal) (name (string-ascii 50)) (tier (string-ascii 20)) (threshold uint))
  (let
    (
      (token-id (+ (var-get last-token-id) u1))
      (minter (var-get authorized-minter))
    )
    (asserts! 
      (or 
        (is-eq tx-sender contract-owner)
        (is-eq (some tx-sender) minter)
      ) 
      err-not-authorized
    )
    
    (try! (nft-mint? bitsave-badge token-id recipient))
    
    (map-set token-metadata token-id {
      name: name,
      tier: tier,
      threshold: threshold
    })
    
    (var-set last-token-id token-id)
    (ok token-id)
  )
)

(define-public (burn (token-id uint))
  (let
    ((owner (unwrap! (nft-get-owner? bitsave-badge token-id) err-not-found)))
    (asserts! (is-eq tx-sender owner) err-not-authorized)
    (nft-burn? bitsave-badge token-id owner)
  )
)

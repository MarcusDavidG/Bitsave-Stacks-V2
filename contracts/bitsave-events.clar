;; BitSave Events
;; Event emission utilities for the BitSave protocol

;; Event definitions
(define-map event-log uint {event-type: (string-ascii 50), user: principal, amount: uint, block-height: uint})
(define-data-var event-counter uint u0)

;; Emit deposit event
(define-private (emit-deposit-event (user principal) (amount uint))
  (let ((counter (+ (var-get event-counter) u1)))
    (var-set event-counter counter)
    (map-set event-log counter {
      event-type: "deposit",
      user: user,
      amount: amount,
      block-height: block-height
    })
    (print {event: "deposit", user: user, amount: amount, id: counter})
  )
)

;; Emit withdrawal event
(define-private (emit-withdrawal-event (user principal) (amount uint) (rewards uint))
  (let ((counter (+ (var-get event-counter) u1)))
    (var-set event-counter counter)
    (map-set event-log counter {
      event-type: "withdrawal",
      user: user,
      amount: (+ amount rewards),
      block-height: block-height
    })
    (print {event: "withdrawal", user: user, principal: amount, rewards: rewards, id: counter})
  )
)

;; Get event by ID
(define-read-only (get-event (event-id uint))
  (map-get? event-log event-id)
)

;; Get total events
(define-read-only (get-event-count)
  (var-get event-counter)
)

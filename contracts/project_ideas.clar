;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-not-found (err u100))
(define-constant err-already-voted (err u101))

;; Data structures
(define-map ideas
  { id: uint }
  {
    title: (string-ascii 100),
    description: (string-ascii 500),
    category: (string-ascii 50),
    votes: uint,
    submitted-by: principal,
    timestamp: uint
  }
)

(define-map user-votes
  { user: principal, idea-id: uint }
  { voted: bool }
)

;; Data vars
(define-data-var next-idea-id uint u1)

;; Public functions
(define-public (submit-idea (title (string-ascii 100)) (description (string-ascii 500)) (category (string-ascii 50)))
  (let
    (
      (idea-id (var-get next-idea-id))
    )
    (map-set ideas
      { id: idea-id }
      {
        title: title,
        description: description,
        category: category,
        votes: u0,
        submitted-by: tx-sender,
        timestamp: block-height
      }
    )
    (var-set next-idea-id (+ idea-id u1))
    (ok idea-id)
  )
)

(define-public (vote-idea (idea-id uint) (vote bool))
  (let
    (
      (idea (unwrap! (map-get? ideas { id: idea-id }) err-not-found))
      (user-vote (map-get? user-votes { user: tx-sender, idea-id: idea-id }))
    )
    (asserts! (is-none user-vote) err-already-voted)
    (map-set user-votes
      { user: tx-sender, idea-id: idea-id }
      { voted: vote }
    )
    (ok (map-set ideas
      { id: idea-id }
      (merge idea { votes: (if vote (+ (get votes idea) u1) (get votes idea)) })
    ))
  )
)

;; Read only functions  
(define-read-only (get-idea (idea-id uint))
  (ok (map-get? ideas { id: idea-id }))
)

(define-read-only (get-all-ideas)
  (ok (map-get? ideas { id: u0 }))
)

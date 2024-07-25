enum OrderStatus {
  PENDING = "PENDING", // in cart
  AWAITING_PAYMENT = "AWAITING_PAYMENT", // Customer has completed the checkout process, but payment has yet to be confirmed.
  AWAITING_SHIPMENT = "AWAITING_SHIPMENT", //Customer checkouted out, payment confirmed, now waiting for company to process the order for shipment
  SHIPPED = "SHIPPED", //order has been shipped
  COMPLETED = "COMPLETED", //order has been picked up by customer and order is completed
  CANCELLED = "CANCELLED", // order cancelled by the customer
  REFUNDED = "REFUNDED",
}

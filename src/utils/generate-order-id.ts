import orderId from "order-id";

const orderIdContructor = orderId("order-");

export const generateOrderId = () => orderIdContructor.generate();

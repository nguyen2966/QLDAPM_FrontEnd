import { z } from "zod";

export const paymentSchema = z.object({
  fullName: z
    .string()
    .min(1, "Vui lòng nhập họ tên")
    .min(3, "Họ tên phải ít nhất 3 ký tự"),

  email: z
    .string()
    .min(1, "Vui lòng nhập email")
    .email("Email không hợp lệ"),

  phone: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại")
   
    .refine(
      (val) => val.startsWith("0") || val.startsWith("+84"),
      {
        message: "Số điện thoại phải là +84",
      }
    )

    // Check format tổng thể sau
    .refine(
      (val) => /^(0|\+84)[0-9]{9}$/.test(val),
      {
        message: "Số điện thoại không hợp lệ",
      }
    )
});
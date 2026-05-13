import { Book } from "./book";
import { User } from "./user";

export type ReservationStatus = "waiting" | "notified" | "fulfilled" | "cancelled";

export interface Reservation {
  id: number;
  user_id: number;
  book_id: number;
  status: ReservationStatus;
  queue_position: number;
  notified_at: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
  book?: Book;
}

export interface ReservationCheckResponse {
  has_reservation: boolean;
  reservation: Reservation | null;
  queue_position: number | null;
  status: ReservationStatus | null;
  is_notified: boolean;
}

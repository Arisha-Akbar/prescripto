import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect } from "react";

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);

  const [appointments, setAppointments] = useState([]);
  const months = [
    " ",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return (
      dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
    );
  };

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });

      if (data.success) {
        setAppointments(data.appointments.reverse());
        console.log(data.appointments);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        { headers: { token } },
      );
      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const appointmentStripe = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/payment-stripe",
        { appointmentId },
        { headers: { token } },
      );

      if (data.success && data.url) {
        // Redirect to Stripe hosted page (same as GreenCart)
        window.location.href = data.url;
      } else {
        toast.error(data.message || "Payment failed");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const appointmentId = params.get("appointmentId");

    if (paymentStatus === "success" && appointmentId) {
      // Verify payment and update appointment
      verifyPayment(appointmentId);
      // Clean URL
      window.history.replaceState({}, document.title, "/my-appointments");
    } else if (paymentStatus === "cancelled") {
      toast.error("Payment was cancelled");
      window.history.replaceState({}, document.title, "/my-appointments");
    }
  }, []);

  const verifyPayment = async (appointmentId) => {
    try {
      const urlParams = new URLSearchParams(window.location.search);

      // ✅ Get session_id (NOT payment_intent)
      const sessionId = urlParams.get("session_id");

      console.log("Verifying payment:", { appointmentId, sessionId }); 

      if (sessionId) {
        const { data } = await axios.post(
          backendUrl + "/api/user/verify-stripe-payment",
          { appointmentId, sessionId },
          { headers: { token } },
        );

        if (data.success) {
          toast.success("Payment successful! Appointment confirmed.");
          getUserAppointments(); // Refresh list to show "✓ Paid"
        } else {
          toast.error(data.message);
        }
      } else {
        console.warn("No session_id found in URL");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Could not verify payment");
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b border-gray-200">
        My appointments
      </p>
      <div>
        {appointments.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b border-gray-200 "
            key={index}
          >
            <div>
              <img
                className="w-32 bg-indigo-50 "
                src={item.docData.image}
                alt=""
              />
            </div>
            <div className="flex-1 text-sm text-zinc-600">
              <p className="text-neutral-800 font-semibold">
                {item.docData.name}
              </p>
              <p>{item.docData.speciality}</p>
              <p className="text-zinc-700 font-medium mt-1">Address:</p>
              <p className="text-xs">{item.docData.address.line1}</p>
              <p className="text-xs">{item.docData.address.line2}</p>
              <p className="text-xs mt-1">
                <span className="text-sm text-neutral-700 font-medium">
                  Date & Time:
                </span>
                {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>
            <div></div>
            <div className="flex flex-col gap-2 justify-end">
              {/* Pay Online: Show if NOT cancelled AND NOT paid */}
              {!item.cancelled && !item.payment && (
                <button
                  onClick={() => appointmentStripe(item._id)}
                  className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300"
                >
                  Pay Online
                </button>
              )}

              {/* Paid: Show if NOT cancelled AND paid */}
              {!item.cancelled && item.payment && (
                <button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-600 bg-green-50">
                   Paid
                </button>
              )}

              {/* Cancel: Show if NOT cancelled AND NOT paid */}
              {!item.cancelled && !item.payment && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                >
                  Cancel appointment
                </button>
              )}

              {/* Cancelled status */}
              {item.cancelled && (
                <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500">
                  Appointment cancelled
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;

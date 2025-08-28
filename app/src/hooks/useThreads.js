import useGet from "./useGet";
import usePost from "./usePost";

const GET_THREADS = `https://api.cribconnect.xyz/v1/user/threads`
const PAY_THREAD = `https://api.cribconnect.xyz/v1/users/payment`

function useThreads() {


  const { data: threads, loading: isLoading, error } = useGet(GET_THREADS);
  const { response: paymentResponse, loading: paymentLoading, error: paymentError, postData } = usePost();

  const payThread = (user_id) => {
    postData(PAY_THREAD, { userId_2: user_id });
  };

  return {
    threads: threads || [],
    isLoading,
    error,
    paymentResponse,
    paymentLoading,
    paymentError,
    payThread,
  };

}

export default useThreads;

import useGet from "./useGet";
import usePost from "./usePost";
import useDelete from "./useDelete";

const GET_THREADS = `https://api.cribconnect.xyz/v1/user/threads`
const PAY_THREAD = `https://api.cribconnect.xyz/v1/users/payment`
const DELETE_THREAD = (thread_id) =>
  `https://api.cribconnect.xyz/v1/threads/${thread_id}`;

function useThreads() {


  const { data: threads, loading: isLoading, error } = useGet(GET_THREADS);
  const { response: paymentResponse, loading: paymentLoading, error: paymentError, postData } = usePost();
  const { deleteData, loading: deleteLoading, error: deleteError, response: deleteResponse } = useDelete();

  const deleteThread = async (thread_id) => {
    console.log("thread to be deleted",thread_id)
    await deleteData(DELETE_THREAD(thread_id));
  };
  
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

    deleteLoading,
    deleteError,
    deleteResponse,

    payThread,
    deleteThread,
  };

}

export default useThreads;

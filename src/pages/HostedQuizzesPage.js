import React, { useEffect, useState } from "react";
import { useAPI } from "../hooks/useAPI";
import {
  ChevronRight,
  ListChecks,
  Calendar,
  Hash,
  Users,
  Trash2, // Added for delete icon
  Loader2, // Added for loading spinner
  AlertTriangle, // Added for modal icon
} from "lucide-react";

// ## Component: SkeletonCard ## (No changes)
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent dark:bg-slate-800">
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 dark:bg-slate-700"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 dark:bg-slate-700"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 dark:bg-slate-700"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-6 dark:bg-slate-700"></div>
      <div className="h-5 bg-gray-200 rounded w-1/4 dark:bg-slate-700"></div>
    </div>
  </div>
);

// ## NEW Component: ConfirmationModal ##
const ConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md text-center">
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mt-4 dark:text-slate-100">{title}</h3>
        <p className="text-sm text-gray-500 mt-2 dark:text-slate-400">{message}</p>
        <div className="mt-6 flex justify-center gap-4">
          <button
            type="button"
            className="px-6 py-2 rounded-lg text-sm font-semibold bg-white dark:bg-slate-700 dark:text-slate-200 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};


// ## MODIFIED Component: HostedQuizCard ##
const HostedQuizCard = ({ quiz, onViewDetailsClick, onDeleteClick }) => (
  <div
    className="relative bg-white rounded-xl shadow-md p-6 border-2 border-transparent transition-all group border-t-4 border-t-indigo-500 dark:bg-slate-800 dark:border-t-indigo-500"
  >
    {/* --- NEW: Delete Button --- */}
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent card click event
        onDeleteClick();
      }}
      className="absolute top-4 right-4 p-2 rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-700 transition-all dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900"
      aria-label="Delete session"
    >
      <Trash2 className="w-4 h-4" />
    </button>
    
    {/* Title */}
    <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-indigo-600 transition dark:text-slate-100 dark:group-hover:text-indigo-400">
      {quiz.quizTitle}
    </h3>

    {/* Metadata with Icons */}
    <div className="space-y-2 mb-6">
      <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
        <Hash className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0 dark:text-indigo-400" />
        Join Code:
        <span className="ml-2 font-mono font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded dark:bg-indigo-900/50 dark:text-indigo-400">
          {quiz.joinCode}
        </span>
      </div>
      <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
        <ListChecks className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0 dark:text-indigo-400" />
        {quiz.totalQuestions} Questions
      </div>
      <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
        <Calendar className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0 dark:text-indigo-400" />
        Hosted: {quiz.hostedAt ? new Date(quiz.hostedAt).toLocaleString() : "N/A"}
      </div>
    </div>

    {/* Action Footer - now clickable */}
    <div
      onClick={onViewDetailsClick}
      className="text-indigo-600 font-medium flex items-center group-hover:underline cursor-pointer dark:text-indigo-400 w-fit"
    >
      View Details <ChevronRight className="w-4 h-4 ml-1" />
    </div>
  </div>
);

// ## MODIFIED Component: HostedQuizzesPage ##
const HostedQuizzesPage = ({ user, onNavigate }) => {
  const { apiCall } = useAPI();
  const [hostedQuizzes, setHostedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- NEW: State for delete functionality ---
  const [quizToDelete, setQuizToDelete] = useState(null); // Stores joinCode of quiz to delete
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchHostedQuizzes = async () => {
      if (!user?.username) {
        setLoading(false);
        return;
      }
      try {
        const data = await apiCall(`/quiz/${user.username}/HostedQuiz`, {
          method: "GET",
        });
        setHostedQuizzes(data || []);
      } catch (err) {
        console.error("Error fetching hosted quizzes:", err);
        setHostedQuizzes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHostedQuizzes();
  }, [user, apiCall]);

  // --- MODIFIED: Delete handler function with improved error handling ---
  const handleDeleteSession = async () => {
    if (!quizToDelete) return;

    setIsDeleting(true);
    try {
      // Using the endpoint structure you provided
      await apiCall(`/sessions/${quizToDelete}/deleteSession`, {
        method: "DELETE",
      });
      // Update state to remove the deleted quiz from the UI
      setHostedQuizzes(currentQuizzes =>
        currentQuizzes.filter(quiz => quiz.joinCode !== quizToDelete)
      );
      closeDeleteModal();
    } catch (err) {
      console.error("Failed to delete session:", err);
      // Check for 403 Forbidden error and provide specific feedback
      if (err.message && err.message.includes("403")) {
        alert("Permission Denied: You do not have permission to delete this session.");
      } else {
        alert("Error: Could not delete the session. Please try again later.");
      }
    } finally {
      setIsDeleting(false);
      // Close modal even on error
      closeDeleteModal();
    }
  };

  const openDeleteModal = (joinCode) => {
    setQuizToDelete(joinCode);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setQuizToDelete(null);
  };

  return (
    <>
      <main>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : hostedQuizzes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border dark:bg-slate-800 dark:border-slate-700">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4 dark:text-slate-600" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-slate-100">
              No hosted quizzes yet
            </h3>
            <p className="text-gray-600 mb-6 dark:text-slate-400">
              Host a quiz from the "My Quizzes" section to see its history here!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostedQuizzes.map((quiz) => (
              <HostedQuizCard
                key={quiz.id || quiz.joinCode}
                quiz={quiz}
                onViewDetailsClick={() =>
                  onNavigate("hostedQuizAnalytics", {
                    quizId: quiz.quizId,
                    quizTitle: quiz.quizTitle,
                    joinCode: quiz.joinCode,
                    username: user.username,
                  })
                }
                onDeleteClick={() => openDeleteModal(quiz.joinCode)}
              />
            ))}
          </div>
        )}
      </main>
      
      {/* --- NEW: Render the modal --- */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteSession}
        isDeleting={isDeleting}
        title="Delete Session"
        message={`Are you sure you want to permanently delete the session with join code "${quizToDelete}"? This action cannot be undone.`}
      />
    </>
  );
};

export default HostedQuizzesPage;


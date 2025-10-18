import React, { useEffect, useState } from "react";
import { useAPI } from "../hooks/useAPI";
import {
  ChevronRight,
  ListChecks,
  Calendar,
  Hash,
  Users,
  ChevronLeft,
} from "lucide-react";

// ## New Component: SkeletonCard ##
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

// ## Improved Component: HostedQuizCard ##
const HostedQuizCard = ({ quiz, onClick }) => (
  <div
    className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent cursor-pointer hover:border-indigo-500 transition-all group border-t-4 border-t-indigo-500 dark:bg-slate-800 dark:hover:border-indigo-500 dark:border-t-indigo-500"
    onClick={onClick}
  >
    {/* Title */}
    <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-indigo-600 transition dark:text-slate-100 dark:group-hover:text-indigo-400">
      {quiz.quizTitle}
    </h3>

    {/* Metadata with Icons */}
    <div className="space-y-2 mb-6">
      <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
        <Hash className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0 dark:text-indigo-400" />
        Session ID:
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

    {/* Action Footer */}
    <div className="text-indigo-600 font-medium flex items-center group-hover:underline dark:text-indigo-400">
      View Details <ChevronRight className="w-4 h-4 ml-1" />
    </div>
  </div>
);

// ## Improved Component: HostedQuizzesPage ##
const HostedQuizzesPage = ({ user, onNavigate }) => {
  const { apiCall } = useAPI();
  const [hostedQuizzes, setHostedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Note: This component is rendered *inside* the Dashboard,
  // so the main page background (bg-gray-50 dark:bg-slate-900) is already set.
  // We don't need to wrap this in another div.
  return (
    <>
      {/* The header is part of the parent Dashboard component, 
        so we only render the main content here.
      */}
      <main>
        {loading ? (
          // Skeleton Loading State
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : hostedQuizzes.length === 0 ? (
          // Empty State
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border dark:bg-slate-800 dark:border-slate-700">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4 dark:text-slate-600" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-slate-100">
              No hosted quizzes yet
            </h3>
            <p className="text-gray-600 mb-6 dark:text-slate-400">
              Create and host your first quiz to see it here!
            </p>
          </div>
        ) : (
          // Content State
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostedQuizzes.map((quiz) => (
              <HostedQuizCard
                key={quiz.id || quiz.joinCode} // Use a stable key
                quiz={quiz}
                onClick={() =>
                  onNavigate("hostedQuizAnalytics", {
                    quizTitle: quiz.quizTitle,
                    joinCode: quiz.joinCode,
                    username: user.username,
                  })
                }
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default HostedQuizzesPage;
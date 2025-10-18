import React, { useEffect, useState } from "react";
import { useAPI } from "../hooks/useAPI";
import { ChevronRight } from "lucide-react";

const HostedQuizCard = ({ quiz, onClick }) => (
  <div
    className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent mb-4 cursor-pointer hover:border-indigo-500 transition"
    onClick={onClick}
  >
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{quiz.quizTitle}</h3>
    <p className="text-gray-600 mb-1">
      Hosted At: {quiz.hostedAt ? new Date(quiz.hostedAt).toLocaleString() : "N/A"}
    </p>
    <p className="text-gray-600 mb-1">Total Questions: {quiz.totalQuestions}</p>
    <p className="text-gray-600 mb-1">Session ID: {quiz.joinCode}</p>
    <button className="mt-4 text-indigo-600 font-medium flex items-center">
      View Details <ChevronRight className="w-4 h-4 ml-1" />
    </button>
  </div>
);

const HostedQuizzesPage = ({ user, onNavigate }) => {
  const { apiCall } = useAPI();
  const [hostedQuizzes, setHostedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHostedQuizzes = async () => {
      try {
        const data = await apiCall(`/quiz/${user.username}/HostedQuiz`, { method: "GET" });
        console.log("Hosted quizzes response:", data); // <-- Add this line
        setHostedQuizzes(data || []);
      } catch (err) {
        console.error("Error fetching hosted quizzes:", err); // <-- Add this line
        setHostedQuizzes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHostedQuizzes();
  }, [user, apiCall]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Hosted Quizzes</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading hosted quizzes...</h3>
          </div>
        ) : hostedQuizzes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hosted quizzes yet</h3>
            <p className="text-gray-600 mb-6">Create and host your first quiz!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostedQuizzes.map((quiz) => (
              <HostedQuizCard
                key={quiz.id}
                quiz={quiz}
                onClick={() =>
                  onNavigate("hostedQuizDetails", {
                    quizId: quiz.quizId,
                    joinCode: quiz.joinCode,
                    quizTitle: quiz.quizTitle,
                    totalQuestions: quiz.totalQuestions,
                    hostedAt: quiz.hostedAt,
                  })
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HostedQuizzesPage;
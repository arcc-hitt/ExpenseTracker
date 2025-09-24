export default function Welcome({ onLogout }) {
  return (
    <div className="w-full max-w-2xl text-center">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-10 pb-12">
        <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">Welcome to Expense Tracker</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">This is a dummy screen after successful login.</p>
        <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded">Logout</button>
      </div>
    </div>
  )
}

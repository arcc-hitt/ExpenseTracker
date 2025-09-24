import React from 'react'

export default function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 rounded shadow-lg w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
          <button onClick={onClose} className="text-gray-600 dark:text-gray-300 hover:text-gray-800">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

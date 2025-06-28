import React from 'react'

const ML = () => {
  return (
    <div>
      <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Machine Learning Models</h1>
      <div className="flex flex-col gap-4">
        {/* this commented line is the Colab notebook */}
        <a
          href="https://1cfdbc68c8e9d72b72.gradio.live/"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-center"
          target="_blank"
          rel="noopener noreferrer"
        >
          Test Recommendation System
        </a>
        {/* <a href="https://colab.research.google.com/drive/1gwIkQZotyM55ss80A__w9Qq1vCH6sB_Z#scrollTo=957bCZUfs7B1" className="link-button">Test Recommendation System</a> */}
        <a
          href="https://fbcb8c0dbe5597357f.gradio.live/"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-center"
          target="_blank"
          rel="noopener noreferrer"
        >
          Hospital Bed Occupancy Prediction
        </a>
        {/* <a href="https://colab.research.google.com/drive/1ncP17XN5pcEvYY9WdljwHsv2noVGvB5_" className="link-button">Hospital Bed Occupancy Prediction</a> */}
        <a
          href="priority_scheduling.html"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-center"
        >
          Priority Scheduling
        </a>
        <a
          href="ai_chatbot.html"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-center"
        >
          AI Chatbot
        </a>
      </div>
    </div>
    </div>
  )
}

export default ML

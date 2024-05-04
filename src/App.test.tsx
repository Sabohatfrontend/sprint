import React from 'react'
import { render, screen } from '@testing-library/react'
import App from './App'
import '@testing-library/jest-dom'

test('renders Hello, world! text', () => {
  render(<App />)
  const helloElement = screen.getByText(/Hello, world!/i)
  expect(helloElement).toBeInTheDocument()
})

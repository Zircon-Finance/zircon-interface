import React from "react"

const Trans = ({ children, ...props }) => {
  if (typeof children !== 'string') {
    throw new Error('children not string in Trans is not supported yet')
  }
  return <>{children}</>
}

export default Trans

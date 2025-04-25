import Navbar from '@/components/Navbar'
import React, { Children } from 'react'

const layout = () => {
  return (
   <>
   <Navbar />
   {Children}
   </>
  )
}

export default layout
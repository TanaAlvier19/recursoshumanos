import Image from "next/image"
// import CompanyRegistration from "@/app/formulario/page";

import { User } from "lucide-react";

const Navbar = () => {
  return (
    <div className='flex h-20  items-center justify-between p-2 bg-transparent '>
    {/* SEARCH BAR */}
    <div className='md:flex items-center gap-2 px-2'>
      <Image src="/onono1.jpg" alt="" className=" mix-blend-lighten " width={340} height={240}/>
    </div>
    {/* ICONS AND USER */}
    <div className='flex items-center gap-6 justify-end w-full'>
     
      <div className='flex flex-col'>
        <span className="text-xs leading-3 font-medium"></span>
        <span className="text-[10px] text-gray-500 text-right">Admin</span>
      </div>
      <User size={40} color='#fff' />
    </div>
  </div>

  )
}

export default Navbar

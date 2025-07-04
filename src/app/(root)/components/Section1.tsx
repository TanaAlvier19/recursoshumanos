"use client"

import BlurText from "@/app/animationComponents/BlurText";
import SplitText from "@/app/animationComponents/SplitText";
import Particles from "@/Particles";
import Image from "next/image"
import Link from 'next/link'

export default function Section1() {
    console.log('Hello, I am a client component');
    return (
        <div className="w-full h-120 bg-[#27282c] p-5">
        
            <div className="block justify-center mx-auto md:flex md:flex-row sm:flex-col align-content-center">
                <div className="py-5 md:w-1/2">
                
                        <BlurText
                            text="Simplifique sua gestão de RH com o nosso software."
                            delay={150}
                            animateBy="words"
                            direction="top"
                            className="text-white text-5xl font-bold bg-gradient-to-r from-[#3ffc2f] to-[#2f83c3] bg-clip-text text-transparent"
                            onAnimationComplete={() => {}}
                        />
                        {/* <h1 className="text-white text-5xl font-bold bg-gradient-to-r from-[#3ffc2f] to-[#2f83c3] bg-clip-text text-transparent">
                                Simplifique sua gestão de RH com o nosso software.
                        </h1> */}

                        <SplitText
                            text="Gerência de dados da sua instituição de forma mais eficiente"
                            className="mt-10 flex text-white"
                            delay={100}
                            duration={0.6}
                            ease="power3.out"
                            splitType="chars"
                            from={{ opacity: 0, y: 40 }}
                            to={{ opacity: 1, y: 0 }}
                            threshold={0.1}
                            rootMargin="-100px"
                            textAlign="center"
                        />
                        {/* <span className="mt-10 flex text-white">
                                Gerência de dados da sua instituição de forma mais eficiente
                        </span> */}
                </div>
                        {/* Image */}
                <div className="-my-10 md:block mb-10 md:-mb-28 sm:mb-0">
                            
                    <Image src='/hr.png' alt="assesment" className="w-100" width={400} height={400} />
                </div>
            </div>
                    {/* Buttons */}
                    <div className="gap-x-1 sm:gap-x-9 flex lg:ml-28 sm:mt">
                        <Link
                            href="/registrar"
                            className="bg-white p-3 sm:p-5 rounded-3xl hover:bg-transparent hover:border-white hover:border-2"
                        >
                            <span className="text-black hover:text-white ">Registrar agora</span>
                        </Link>
                        <Link
                            href="/login"
                            className="bg-transparent border-2 
                            border-white p-3 sm:p-5 rounded-3xl hover:bg-white"
                        >
                            <span className="text-white hover:text-black text-center ">Entrar agora</span>
                        </Link>
                    </div>
                
        </div>
    );
}

'use client'
import React, { ReactElement, ReactEventHandler, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {motion} from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"
import {Label} from "@/components/ui/label"
import {Button} from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  
  FileText,
  
} from "lucide-react"
import Swal from "sweetalert2"

export default function Modulos() {
  const dados=[{id:1, value:"Gestão de Formações"},
    {id:2, value:"Gestão de Tempo"},
    {id:3, value:"Gestão de Dados"},
    {id:4, value:"Folha de Pagamento"},
    {id:5, value:"Recrutamento"},
  ]
const router=useRouter()
const [modulos, setmodulos]=useState<string[]>([])
const selecionada = (event:React.ChangeEvent<HTMLInputElement>) => {
  const value = event.target.value
  const checked = event.target.checked
  if(checked){
    setmodulos([...modulos, value])
  }else{
    const filtrar=modulos.filter((data)=> data!==value)
    setmodulos(filtrar)
  }
}
const Enviarmodulos=async()=>{
try {
const dados={
nome:modulos
}
const res=await fetch("http://localhost:8000/modulos/",{

  method:"POST",
  headers:{
    "Content-Type":"application/json"
  },
  credentials:"include",
  body:JSON.stringify(dados)
})
if(res.ok){

  Swal.fire("Modulos Adicionados",`Foram adicionados ${modulos}`,"success" )
  setmodulos([])
  router.push("/personaliza")
}
}catch{

}
}
  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-b from-purple-600 to-blue-600">
      
      <div className="flex justify-center items-center ">
          <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex text-center items-center flex-col mb-4 mx-auto">
                    <h3 className="text-lg font-bold">Modúlos que combinam com a Empresa</h3>
                    <h3 className=" font-sans">Selecione modúlos </h3>

                  </div>
                  <div className="gap-2 flex-col flex">
                  {dados.map((data)=>(
                    <div key={data.id} className="flex gap-3">
                    <input
                    type="checkbox"
                    value={data.value}
                    onChange={selecionada}
                    />
                    <Label>{data.value}</Label>
                    </div>
                  ))}
                  <Button className="bg-purple-700" onClick={Enviarmodulos}>Adicionar Módulos</Button>
                  </div>
                </CardContent>
              </Card>

      </div>
    </div>
  )
}

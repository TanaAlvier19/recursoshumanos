/* Nesta page vamos deseevolvemos o painel público que os candidatos poderão aplicar para vagas dísponíveis */
"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Search, MapPin, X, Calendar, Briefcase, Clock, CheckCircle, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {Label} from "@/components/ui/label"
import Swal from "sweetalert2"

type Vaga = {
  id: string,
  titulo: string,
  empresa: string,
  departamento: string,
  requisitos: string,
  dataFim: string,
  status: 'aberta' |  'fechada',
  dataPublicacao: string,
  localizacao: string,
  tipoVaga: 'Tempo Integral' | 'Meio Periodo'|'Remoto'
}

export default function EmpresaPage() {
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [filteredVagas, setFilteredVagas] = useState<Vaga[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [tipoFilter, setTipoFilter] = useState<string>('todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [vagaSelecionada, setVagaSelecionada] = useState('')
  const [abrirCandi, setabrirCandi] = useState(false)
  const [nome,setnome]=useState('')
  const [obs,setobs]=useState('')
  const [email,setemail]=useState('')
  const [empresa_id, setempresa_id]=useState('')
  const [telefone,settelefone]=useState('')
  const [requisitos,setrequisitos]=useState('')
  const [curriculum,setcurriculum]=useState <File | null>(null)
  const itemsPerPage = 8
  
  const params = useParams()
  const empresa = params.empresa
  useEffect(() => {
    async function fetchVagas() {
      try {
        setLoading(true)
        const res = await fetch(`http://localhost:8000/empresas/?empresa=${empresa}`)
        const data = await res.json()
        setVagas(data)
        setempresa_id( data.map((item:{empresa:string})=>(item.empresa))[0])
        setFilteredVagas(data)
      } catch (error) {
        console.error('Erro ao buscar vagas:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (empresa) fetchVagas()
  }, [empresa])
  const Candidatura =async ()=>{
    try{
      const dados = new FormData
      dados.append('nome', nome)
      dados.append('telefone', telefone)
      dados.append('email', email)
      dados.append('observacoes', obs)
      dados.append('vaga', vagaSelecionada)
      dados.append('empresa', empresa_id)
      if(curriculum){
      dados.append('curriculum', curriculum)
      }
      const res=await fetch("http://localhost:8000/Candidatura/",{
        method:"POST",
        body:dados
      })
      if(res.ok){
        Swal.fire("Candidatura Feita", "Serás Notificado em Breve sobre a Candidatura","success")
      }
    }catch(err){


    }
  }
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aberta':
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Aberta</span>
      case 'pausada':
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Pausada</span>
      case 'fechada':
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Fechada</span>
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">{status}</span>
    }
  }

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'Tempo Integral':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Tempo Integral</span>
      case 'Meio Periodo':
        return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Meio Período</span>
      case 'Remoto':
        return <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">Freelance</span>
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">{tipo}</span>
    }
  }
  function abriModal(vagaId: string): void {
    setVagaSelecionada(vagaId);
    setabrirCandi(true)
  }
   const clearFilters = () => {
     setSearchTerm('')
     setStatusFilter('todos')
     setTipoFilter('todos')
   }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Oportunidades na <b className="text-blue-600">{empresa}</b>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubra as vagas disponíveis e faça parte de uma equipe inovadora que está transformando o mercado.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Filter className="mr-2 h-5 w-5 text-indigo-600" />
              Filtrar Vagas
            </h2>
            <div className="flex gap-2">
              {(searchTerm || statusFilter !== 'todos' || tipoFilter !== 'todos') && (
                <Button 
                  variant="outline" 
                  // onClick={clearFilters}
                  className="flex items-center"
                >
                  <X className="mr-1 h-4 w-4" /> Limpar filtros
                </Button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por cargo ou área..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="aberta">Abertas</SelectItem>
                  <SelectItem value="pausada">Pausadas</SelectItem>
                  <SelectItem value="fechada">Fechadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Vaga</label>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="integral">Tempo Integral</SelectItem>
                  <SelectItem value="meio-periodo">Meio Período</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            {filteredVagas.length} {filteredVagas.length === 1 ? 'vaga encontrada' : 'vagas encontradas'}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-4/5 mb-4" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredVagas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma vaga encontrada</h3>
            <p className="text-gray-600 mb-6">
              Não encontramos vagas correspondentes aos seus filtros. Tente ajustar os critérios de busca.
            </p>
            <Button >Limpar todos os filtros</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vagas.map((vaga) => (
                <Card 
                  key={vaga.id} 
                  className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-indigo-300"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900">{vaga.titulo}</CardTitle>
                        {/* <CardDescription className="mt-1">{vaga.departamento}</CardDescription> */}
                      </div>
                      {getStatusBadge(vaga.status)}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {getTipoBadge(vaga.tipoVaga)}
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="mr-1 h-4 w-4" />
                          {vaga.localizacao}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-1 h-4 w-4" />
                          Encerra em {new Date(vaga.dataFim).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Requisitos:</h4>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {vaga.requisitos}
                        </p>
                      </div>
                      
                      <Button 
                      onClick={()=>abriModal(vaga.id)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors">
                        Candidatar-se
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
        <div>
        <Dialog open={abrirCandi} onOpenChange={setabrirCandi}>
        <DialogTrigger></DialogTrigger>
        <DialogContent>

        <DialogHeader>
        <DialogTitle className='text-center'>Aplicar candidatura na  {empresa}</DialogTitle>
        <DialogDescription className='text-center'>
        Coloque os dados para fazer a candidatura
        </DialogDescription>
        </DialogHeader>
        <div className='grid lg:grid-cols-1 md:grid-cols-2 gap-4'>
        
            <div className='flex flex-col gap-2'>
              <Label>Nome do Candidato<b className="text-red-600">*</b></Label>
            <Input type="text"
            value={nome}
            onChange={(e)=>setnome(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            required
            
            />
            </div>
            <div className='flex flex-col gap-2'>
            <Label>Email do Candidato<b className="text-red-600">*</b></Label>
            <Input type="email"
            value={email}
            onChange={(e)=>setemail(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 h-10 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            required
            
            />
            </div><div className='flex flex-col gap-2'>
            <Label>Telefone do Candidato<b className="text-red-600">*</b></Label>
            <Input type="tel"
            value={telefone}
            onChange={(e)=>settelefone(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 h-10 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            required
            
            />
            </div>
            <div className='flex flex-col gap-2'>
            <Label>Curriculum<b className="text-red-600">*</b></Label>
            <Input type="file"
            
            onChange={(e)=>{if(e.target.files && e.target.files[0]){setcurriculum(e.target.files[0])}}}
            className="border border-gray-300 rounded-lg px-3 h-10 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            required
            />
            </div>
            <div className='flex flex-col gap-2'>
            <Label>Informações Adicionais Sobre Candidato</Label>
            <Input type="text"
            value={obs}
            onChange={(e)=>setobs(e.target.value)}
            className="border border-gray-300 rounded-lg px-3  h-20 py-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            />
            </div>
          </div>
        <Button className='bg-blue-600 hover:bg-purple-600' onClick={Candidatura}>Aplicar Para a Vaga</Button>
        </DialogContent>
        </Dialog>
        </div>
        {!loading && filteredVagas.length > 0 && (
          <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-center text-white">
            <div className="max-w-3xl mx-auto">
              <Briefcase className="mx-auto h-12 w-12 mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Não encontrou a vaga ideal?</h2>
              <p className="text-indigo-100 mb-6">
                Cadastre seu currículo em nosso banco de talentos e seja notificado quando surgirem novas oportunidades que combinam com seu perfil.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button className="bg-white text-indigo-700 hover:bg-gray-100 px-8 py-6 text-base">
                  Cadastrar currículo
                </Button>
                <Button variant="outline" className="bg-transparent border-white text-white hover:bg-indigo-700 px-8 py-6 text-base">
                  Receber alertas de vagas
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
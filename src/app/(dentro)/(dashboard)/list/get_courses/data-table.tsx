"use client"

import { Button } from "@/components/ui/button"
import * as React from "react"
import 'react'
import { useState, useEffect } from "react"
import Swal from 'sweetalert2'
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle ,CardFooter} from "@/components/ui/card"
import { Label } from '@/components/ui/label'
import { useToast } from "@/hooks/use-toast" 
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import {Plus} from "lucide-react"
import {

  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Courses } from "./columns"

import { Textarea } from "@material-tailwind/react"
import { Plus } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}
interface Cursos {
  id: number;
  titulo: string;
  Carga_horaria:string 
  Formadores: string

  area_tematica: string
dataFim: string

dataInicio: string

descricao: string

empresaParceira: string
horario:string

local:string 
modalidade:string 
}
type Departamento = {
  id: string;
  nome: string;  
};
export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  
  const [formData, setFormData] = useState({
    course: '',
    description: '',
    init_date: '',
    finish_date: '',
    instructors: '',
    requirements: ''
  })
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [ isDialogOpen, setIsDialogOpen ] = useState(false)
  const [ isDialogOpen1, setIsDialogOpen1 ] = useState(false) 
  const [local, setlocal]=useState('')
    const [DepartamentoSelecionado, setDepartamentoSelecionado]=useState<string>('')
  const [departamentos,setdepartamentos]=useState<Departamento[]>([])
  
  const [titulo, settitulo]=useState('')
  const [area, setarea]=useState('')
  const [vaga, setvaga]=useState(0)
  const [duracao, setduracao]=useState(0)
  const [modalidade, setmodalidade]=useState('')
  const [horario, sethorario]=useState('')
  const [Formadores, setFormadores]=useState('')
  const [descricao, setdescricao]=useState('')
  const [dataInicio, setdataInicio]=useState('')
  const [dataFim, setdataFim]=useState('')
  
  const [empresaParceira, setempresaParceira]=useState('')
  const [cargaHoraria,setcargaHoraria]=useState(0)
  const [CursoSelecionado, setCursoSelecionado]=useState<string>('')
  const [cursos, setcursos]=useState<Cursos[]>([])
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const [traineeData, setTraineeData] = useState({
    nome: '',
    curso: ''
  })
  const handleTraineeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTraineeData(prev => ({ ...prev, [name]: value }))
  }

  



// Função robusta para formatação de datas
// function formatDate(dateString: string): string {
//         if (!dateString) return 'N/A';
        
//         const date = new Date(dateString);
        
//         // Validação mais robusta da data
//         if (isNaN(date.getTime())) {
//             console.error('Data inválida:', dateString);
//             return 'Data inválida';
//         }

//         const day = String(date.getDate()).padStart(2, '0');
//         const month = String(date.getMonth() + 1).padStart(2, '0');
//         const year = date.getFullYear();

//         return `${day}/${month}/${year}`;
//     }

// // Função para obter dados dos cursos
// async function getCoursesData(): Promise<Course[]> {
//   try {
//     const response = await fetch('https://avd-trainings.onrender.com/trainings/get_courses');
    
//     if (!response.ok) {
//       throw new Error(`Erro HTTP: ${response.status}`);
//     }

//     const data = await response.json();
  
//   } catch (error) {
//     console.error("Erro ao buscar cursos:", error);
//     throw error; // Propaga o erro para ser tratado pelo chamador
//   } 
// }

// Função principal para gerar o relatório
// const generateReport = async () => {
//   try {
//     // 1. Obter os dados
//     const courses = await getCoursesData();
//     console.log('Dados obtidos:', courses);

    // 2. Preparar a estrutura para o relatório
//     const reportData = {
//       title: "Relatório de Cursos",
//       headers: ["Curso", "Status", "Início", "Término", "Instrutores", "Requisitos"],
//       data: courses.map(course => [
//         course.course_name,
//         course.status,
//         course.course_init_date,
//         course.course_finish_date,
//         course.course_instructors,
//         course.course_requirements
//       ])
//     };

//     console.log('Enviando para o backend:', reportData);

//     // 3. Enviar para o backend gerar o PDF
//     const response = await fetch('https://avd-trainings.onrender.com/trainings/generate_report', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(reportData)
//     });

//     // 4. Verificar se a resposta foi bem-sucedida
//     if (!response.ok) {
//       throw new Error(`Erro ao gerar relatório: ${response.statusText}`);
//     }

//     // 5. Processar o PDF retornado
//     const blob = await response.blob();
    
//     // Verificar se o conteúdo é realmente um PDF
//     if (!blob.type.includes('application/pdf')) {
//       throw new Error('O servidor não retornou um PDF válido');
//     }

//     // 6. Criar o download do PDF
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `relatorio_cursos_${new Date().toISOString().slice(0,10)}.pdf`;
//     document.body.appendChild(a);
//     a.click();

//     // 7. Limpeza
//     setTimeout(() => {
//       document.body.removeChild(a);
//       window.URL.revokeObjectURL(url);
//     }, 100);

//   } catch (error) {
//     console.error('Falha ao gerar relatório:', error);
//     alert('Erro ao gerar relatório. Verifique o console para detalhes.');
//   }
// };
const fetchData = async () => {
      try {
        const traineesResponse = await fetch('http://localhost:8000/formacoes/',{
          credentials:"include"
        });
        const traineesData = await traineesResponse.json();
        setcursos(traineesData || []);
      
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        Swal.fire('Erro', 'Falha ao carregar dados. Tente novamente.', 'error');
      } finally {
      }
    };
useEffect(() => {
    
  const Departametos = async () => {
       try {
         const res = await fetch("http://localhost:8000/departamentos/", {
           credentials: "include"
         });
         const data = await res.json();
         if (res.ok) {
           setdepartamentos(data.dados);
           console.log(data.dados)
         }
       } catch (error) {
         console.error("Erro ao buscar dados:", error);
       } finally {
        //  setLoading(false);
       }
     };
    Departametos()
    fetchData();
  }, []);
  console.log(cursos)
const CriarFormacao=async()=>{
  try{
    const dados={
      titulo,
      area_tematica:area,
      dataInicio,
      dataFim,
      modalidade,
      horario,
      empresaParceira,
      departamento:DepartamentoSelecionado,
      descricao,
      local, 
      vagas:vaga,
      Formadores,
      Carga_horaria:duracao,
    }
    
    const res=await fetch("http://localhost:8000/formacoes/",{
    credentials:"include",
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify(dados)
  })
if(res.ok){
  Swal.fire("Feito","Formação adicionada","success")
  fetchData()
}
if(!res.ok){
  Swal.fire("Feito","Formação adicionada","error")
  
}
}
  catch(err){
  alert("erro")
}
}

async function postEnrollData(){
  const response = await fetch('https://new-avd.onrender.com/enroll_trainee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nome: traineeData.nome,
        curso: traineeData.curso
      })
    })

    console.log('status:', response)

    if(response.status == 500){
                    Swal.fire({
                      icon: "error",
                      title: "Oops...",
                      text: "Alguma coisa occorreu mal!",
                      footer: 'Certifique-se de que os dados estão correctos! '
                    });  
                    console.log("Alguma coisa occorreu mal!")
        
      }

      if(response.status == 400){
                    const errorData = await response.json();
                    Swal.fire({
                      icon: "error",
                      title: "Oops...",
                      text: `${errorData.message}`,
                    });  
                    console.log("Alguma coisa occorreu mal!")
        
      }

      if(response.status === 200){

                  setIsDialogOpen1(false)     
                
                  Swal.fire({
                    title: "Cadastrado com sucesso!",
                    icon: "success",
                    draggable: true
                  });
                  console.log("Cadastrado com sucesso!")
                  
          }
}

const inscrever = async () => {
    try {
      const res = await fetch("http://localhost:8000/inscricao/", {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ inscricao:CursoSelecionado,  estado:"aprovado",funcionario:traineeData.nome, })
      });
      
      if (res.ok) {
        Swal.fire("Inscrição Feita", "Sua inscrição foi realizada com sucesso", "success");
        
      } else {
        const errorData = await res.json();
        Swal.fire("Erro", errorData.message || "Não foi possível completar a inscrição", "error");
      }
    } catch (err) {
      Swal.fire("Erro", "Falha na conexão com o servidor", "error");
    }
  };

  

const table = useReactTable({
  data,
  columns,
  onColumnFiltersChange: setColumnFilters,
  getFilteredRowModel: getFilteredRowModel(),
  getCoreRowModel: getCoreRowModel(),
  state: {
    columnFilters,
  }
})

  return (
   <div>

     <div className="flex items-center justify-between py-4 flex-1 ">
        <Input
          placeholder="Filtrar curso..."
          value={(table.getColumn("course_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("course_name")?.setFilterValue(event.target.value)
          }
          className=""
        />
        
        
        <div className=" flex " >
       
        <button
            
            onClick={() => setIsDialogOpen(true) }
            className="px-4 mr-5 
            mt-1 sm:mt-0
            py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            Adicionar Formação
        </button>
        {/* <button
           
            // onClick={() => generateReport() }
            className="px-4 mr-5 
            mt-1 sm:mt-0
            py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            Gerar relatório
        </button> */}

        <Dialog open={isDialogOpen1} onOpenChange={setIsDialogOpen1}>
            <DialogTrigger asChild>
              <button
                    // onClick={() => setShowCreateForm(true)}
                    // disabled={!selectedTable}
                    onClick={() => setIsDialogOpen1(true)}
                    className="px-4 mt-1 sm:mt-0 mr-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                  >
                    Increver funcionário
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" >
              <form onSubmit={inscrever} className="space-y-4 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-6">Increver o funcionário em um certo curso</h2>

              <div className="space-y-2">
                <Label htmlFor="course">Nome do funcionário</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={traineeData.nome}
                  onChange={handleTraineeChange}
                  required
                />
              </div>
              <div className='flex flex-col gap-2'>
              <Label>Curso</Label>
              <Select value={CursoSelecionado} onValueChange={(CursoSelecionado)=>setCursoSelecionado(CursoSelecionado)}>
              <SelectTrigger className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
              <SelectValue placeholder="Selecione um curso" />
              </SelectTrigger>
              <SelectContent>
                {cursos.map((curso) => (
                  <SelectItem key={curso.id} value={curso.titulo}>
                    {curso.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Inscrevendo...' : 'Inscrever'}
              </Button>
            </form>
            
          </DialogContent>
 
        </Dialog>

      </div>



      </div>

    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger></DialogTrigger>
                <DialogContent className="overflow-scroll-auto">
                <DialogHeader>
                <DialogTitle className='text-center'>Adicionar Nova Formação</DialogTitle>
                <DialogDescription className='text-center'>
                
                </DialogDescription>
                </DialogHeader>
                <div className='grid lg:grid-cols-2 md:grid-cols-2 gap-4 overflow-scroll-auto'>
                
                    <div className="space-y-2">
          <Label>Título *</Label>
          <Input 
            value={titulo} 
            onChange={(e) => settitulo(e.target.value)}
            placeholder="Título da formação"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Área Temática *</Label>
          <Select value={area} onValueChange={(area) => setarea(area)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma área" />
            </SelectTrigger>
            <SelectContent>
              {['TI', 'Finanças', 'Soft Skills', 'Liderança', 'Marketing', 'Vendas', 'Operações', 'Compliance'].map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Descrição <b className="text-red-500">*</b></Label>
          <Textarea 
                value={descricao}
                onChange={(e) => setdescricao(e.target.value)}
                placeholder="Descrição detalhada da formação" onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}          />
        </div>
        
        <div className="space-y-2">
          <Label>Carga Horária (horas) <b className="text-red-500">*</b></Label>
          <Input 
            type="number"
            value={duracao} 
            onChange={(e) => setduracao(parseInt(e.target.value))}
            placeholder="Ex: 16"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Modalidade <b className="text-red-500">*</b></Label>
          <Select 
            value={modalidade} 
            onValueChange={(modalidade) => setmodalidade(modalidade)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a modalidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="presencial">Presencial</SelectItem>
              <SelectItem value="híbrida">Híbrida</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Número de Vagas<b className="text-red-500">*</b> </Label>
          <Input 
            type="number"
            value={vaga} 
            onChange={(e) => setvaga(parseInt(e.target.value))}
            placeholder="Ex: 30"
          />
        </div>
        <div className='flex flex-col gap-2'>
              <Label>Departamento</Label>
              <Select value={DepartamentoSelecionado} onValueChange={(DepartamentoSelecionado)=>setDepartamentoSelecionado(DepartamentoSelecionado)}>
              <SelectTrigger className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
              <SelectValue placeholder="Selecione um departamento" />
              </SelectTrigger>
              <SelectContent>
                {departamentos.map((departamento) => (
                  <SelectItem key={departamento.id} value={departamento.id}>
                    {departamento.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
              </div>
        <div className="space-y-2">
          <Label>Data de Início *</Label>
          <Input 
            type="date"
            value={dataInicio} 
            onChange={(e) => setdataInicio(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Data de Término *</Label>
          <Input 
            type="date"
            value={dataFim} 
            onChange={(e) => setdataFim( e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Formadores *</Label>
          <Input 
            value={Formadores} 
             onChange={(e) => setFormadores(e.target.value)}
            placeholder="Nomes separados por vírgula"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Local / Link</Label>
          <Input 
             value={local} 
             onChange={(e) => setlocal(e.target.value)}
            placeholder={modalidade === 'online' ? 'Link de acesso' : 'Local da formação'}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Horários (opcional)</Label>
          <Input 
            value={horario } 
            onChange={(e) => sethorario(e.target.value)}
            placeholder="Ex: Segundas e Quartas, 14h-16h"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Empresa Parceira (opcional)</Label>
          <Input 
            value={empresaParceira} 
            onChange={(e) => setempresaParceira( e.target.value)}
            placeholder="Nome da empresa"
          />
        </div>
                  </div>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={CriarFormacao}>
          Salvar Formação
        </Button>
                </DialogContent>
                </Dialog>
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Carregando...
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
    <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Proxímo
        </Button>
      </div>

   </div> 
    
  )
}

'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { motion } from "framer-motion"
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from "sweetalert2"
import { buscarDados } from '@/lib/api';
import { HomeIcon, PlusCircle, Trash2, HelpCircle, ChevronDown } from "lucide-react";

type FieldDefinition = {
  nome?: string;
  tipo?: string;
  isSystemField?: boolean;
  obrigatorio?: boolean;
  opcoes?: string[];
};

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CriarDepartamento() {
  const router = useRouter();
  const [nomeDepartamento, setNomeDepartamento] = useState('');
  const [apresentar, setApresentar] = useState(false);
  const [empresaId, setEmpresaId] = useState('');
  const [campos, setCampos] = useState<FieldDefinition[]>([
    {
      nome: "",
     tipo: "string",
      isSystemField: true
    },
  ]);
  
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const dadosUsuario = await buscarDados();
        if (!dadosUsuario) {
          Swal.fire({
            title: "Autenticação Necessária",
            text: "Por favor, faça login para acessar esta funcionalidade",
            icon: "warning",
            confirmButtonText: "Ir para Login"
          }).then(() => router.push("/"));
          return;
        }
        
        setEmpresaId(dadosUsuario.empresa.id);
        setApresentar(true);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        Swal.fire("Erro", "Não foi possível carregar os dados da empresa", "error");
      }
    };
    
    carregarDados();
  }, [router]);

  const adicionarCampo = () => {
    setCampos([
      campos[0],
      ...campos.slice(1),
      {
        nome: '',
        tipo: 'text',
        obrigatorio: false
      }
    ]);
  };

  const removerCampo = (index: number) => {
    if (campos[index].isSystemField) return;

    const novosCampos = [...campos];
    novosCampos.splice(index, 1);
    setCampos(novosCampos);
  };

  const validarCampos = () => {
    if (!nomeDepartamento.trim()) {
      setErro("O nome do departamento é obrigatório");
      return false;
    }
    
    if (nomeDepartamento.length > 64) {
      setErro('Nome do departamento não pode exceder 64 caracteres');
      return false;
    }

    const camposPersonalizados = campos.filter(f => !f.isSystemField);
    if (camposPersonalizados.length === 0) {
      setErro('Adicione pelo menos um campo personalizado');
      return false;
    }

    for (const campo of camposPersonalizados) {
      if (!campo.nome?.trim()) {
        setErro('Todos os campos devem ter um nome');
        return false;
      }

      if (campo.nome.length > 64) {
        setErro(`O nome do campo "${campo.nome}" não pode exceder 64 caracteres`);
        return false;
      }

      if (campo.tipo === 'select' && (!campo.opcoes || campo.opcoes.length === 0)) {
        setErro(`O campo "${campo.nome}" do tipo seleção precisa ter opções definidas`);
        return false;
      }
    }

    setErro(null);
    return true;
  };

  const salvarDepartamento = async () => {
    try {
      const dadosDepartamento = {
        nome: nomeDepartamento,
        empresa: empresaId
      };
      
      const res = await fetch('http://localhost:8000/departamentos/', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dadosDepartamento)
      });

      if (!res.ok) {
        const erroData = await res.json();
        throw new Error(erroData.message || 'Erro ao salvar departamento');
      }
      
      return await res.json();
    } catch (error) {
      console.error("Erro ao salvar departamento:", error);
      throw error;
    }
  };

  const salvarCampos = async (departamentoId: string) => {
    try {
      const camposParaEnviar = campos
        .filter(campo => campo.nome && campo.tipo)
        .map(campo => ({
          nome: campo.nome,
          tipo: campo.tipo,
          obrigatorio: campo.obrigatorio || false,
          opcoes: campo.tipo === 'select' ? campo.opcoes : undefined,
          departamento: departamentoId,
          empresa:empresaId
        }));
      
      const res = await fetch('http://localhost:8000/campos/criar/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(camposParaEnviar),
        credentials: "include"
      });

      if (!res.ok) {
        const erroData = await res.json();
        throw new Error(erroData.campos || 'Erro ao salvar campos');
      }
      
      return await res.json();
    } catch (error) {
      console.error("Erro ao salvar campos:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarCampos()) return;
    
    setEnviando(true);
    
    try {
      const departamento = await salvarDepartamento();
      
      await salvarCampos(departamento.id);
      
      setSucesso(true);
      
      Swal.fire({
        title: "Sucesso!",
        text: "Departamento e campos criados com sucesso",
        icon: "success",
        confirmButtonText: "Continuar"
      }).then(() => {
        router.push('/admin');
      });
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro desconhecido ao salvar');
      Swal.fire("Erro", "Ocorreu um erro ao tentar salvar os dados", "error");
    } finally {
      setEnviando(false);
    }
  };

  const adicionarOpcao = (campoIndex: number, novaOpcao: string) => {
    if (!novaOpcao.trim()) return;
    
    const novosCampos = [...campos];
    if (!novosCampos[campoIndex].opcoes) {
      novosCampos[campoIndex].opcoes = [];
    }
    
    novosCampos[campoIndex].opcoes?.push(novaOpcao.trim());
    setCampos(novosCampos);
  };

  const removerOpcao = (campoIndex: number, opcaoIndex: number) => {
    const novosCampos = [...campos];
    novosCampos[campoIndex].opcoes?.splice(opcaoIndex, 1);
    setCampos(novosCampos);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      {!apresentar ? (
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center justify-center gap-3">
            <motion.div
              className="border-gray-300 h-20 w-20 animate-spin rounded-full border-8 border-t-purple-600"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-gray-600">Carregando informações da empresa...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <motion.h1 
              className="text-3xl font-bold text-gray-800 mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Personalize seu Departamento
            </motion.h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Crie um novo departamento e defina os campos personalizados para gerenciar as informações específicas da sua equipe.
            </p>
            
            <Link 
              href="/admin" 
              className="inline-flex items-center mt-6 text-purple-600 hover:text-purple-800 transition-colors"
            >
              <HomeIcon className="mr-2" />
              Voltar para o Painel Principal
            </Link>
          </div>

          <motion.div 
            className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {sucesso ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-5 text-center">
                <div className="flex justify-center mb-4">
                  <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  Departamento Criado com Sucesso!
                </h3>
                <p className="text-green-700 mb-4">
                  Você será redirecionado para o painel em instantes...
                </p>
                <Button 
                  onClick={() => router.push('/admin')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Ir para o Painel Agora
                </Button>
              </div>
            ) : (
              <>
                {erro && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-red-500 mt-0.5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h3 className="text-sm font-medium text-red-800">
                          Atenção
                        </h3>
                        <div className="mt-1 text-sm text-red-700">
                          <p>{erro}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <div className="flex items-start">
                    <HelpCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-800 mb-1">Como personalizar seu departamento?</h3>
                      <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
                        <li>Adicione campos específicos para coletar informações relevantes</li>
                        <li>Para campos de seleção, defina as opções disponíveis</li>
                        <li>Marque como obrigatório quando a informação for essencial</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <label htmlFor="nomeDepartamento" className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Departamento *
                    </label>
                    <Input
                      id="nomeDepartamento"
                      value={nomeDepartamento}
                      onChange={(e) => setNomeDepartamento(e.target.value)}
                      placeholder="Ex: Recursos Humanos, TI, Financeiro"
                      className="w-full"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Nome que identificará este departamento no sistema
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-800">Campos Personalizados</h2>
                      <Button 
                        type="button"
                        onClick={adicionarCampo}
                        variant="outline"
                        className="flex items-center"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Adicionar Campo
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {campos.map((campo, index) => (
                        <div 
                          key={index} 
                          className={`p-5 rounded-lg border ${campo.isSystemField ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'}`}
                        >
                          {campo.isSystemField ? (
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-medium text-gray-700">Campo do Sistema</h3>
                                <p className="text-sm text-gray-500">ID (identificador único)</p>
                              </div>
                              <div className="text-sm text-gray-500">
                                Obrigatório • Tipo: Número
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nome do Campo *
                                  </label>
                                  <Input
                                    value={campo.nome}
                                    onChange={(e) => {
                                      const novosCampos = [...campos];
                                      novosCampos[index].nome = e.target.value;
                                      setCampos(novosCampos);
                                    }}
                                    placeholder="Ex: Nível Hierárquico, Especialização"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Campo *
                                  </label>
                                  <Select 
                                    value={campo.tipo} 
                                    onValueChange={(value) => {
                                      const novosCampos = [...campos];
                                      novosCampos[index].tipo = value;
                                      
                                      if (value !== 'select') {
                                        novosCampos[index].opcoes = undefined;
                                      }
                                      
                                      setCampos(novosCampos);
                                    }}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="text">Texto</SelectItem>
                                      <SelectItem value="number">Número</SelectItem>
                                      <SelectItem value="date">Data</SelectItem>
                                      <SelectItem value="select">Seleção</SelectItem>
                                      <SelectItem value="email">Email</SelectItem>
                                      <SelectItem value="file">Arquivo</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {campo.tipo === 'select' && (
                                <div className="space-y-3">
                                  <label className="block text-sm font-medium text-gray-700">
                                    Opções de Seleção *
                                  </label>
                                  <div className="space-y-2">
                                    {campo.opcoes?.map((opcao, opcaoIndex) => (
                                      <div key={opcaoIndex} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                        <span className="text-sm">{opcao}</span>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          type="button"
                                          onClick={() => removerOpcao(index, opcaoIndex)}
                                          className="text-red-500 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}

                                    <div className="flex">
                                      <Input
                                        id={`nova-opcao-${index}`}
                                        placeholder="Digite uma nova opção"
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const input = e.target as HTMLInputElement;
                                            adicionarOpcao(index, input.value);
                                            input.value = '';
                                          }
                                        }}
                                        className="flex-1 mr-2"
                                      />
                                      <Button 
                                        type="button"
                                        variant="secondary"
                                        onClick={() => {
                                          const input = document.getElementById(`nova-opcao-${index}`) as HTMLInputElement;
                                          if (input) {
                                            adicionarOpcao(index, input.value);
                                            input.value = '';
                                          }
                                        }}
                                      >
                                        Adicionar
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Pressione Enter ou clique em Adicionar para incluir uma opção
                                  </p>
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={`obrigatorio-${index}`}
                                    checked={campo.obrigatorio} 
                                    onCheckedChange={(checked) => {
                                      const novosCampos = [...campos];
                                      novosCampos[index].obrigatorio = checked as boolean;
                                      setCampos(novosCampos);
                                    }} 
                                  />
                                  <label htmlFor={`obrigatorio-${index}`} className="text-sm font-medium text-gray-700">
                                    Campo obrigatório
                                  </label>
                                </div>

                                <Button 
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removerCampo(index)}
                                  className="flex items-center"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Remover
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/admin')}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      disabled={enviando}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {enviando ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Salvando...
                        </>
                      ) : (
                        'Criar Departamento'
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
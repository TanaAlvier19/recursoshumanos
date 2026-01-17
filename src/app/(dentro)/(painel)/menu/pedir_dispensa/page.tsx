'use client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileUploaderRegular } from "@uploadcare/react-uploader";
import "@uploadcare/react-uploader/core.css";
import React, { useState, useEffect, FormEvent, useRef, forwardRef } from "react";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
    DownloadIcon, 
    CalendarIcon, 
    FileTextIcon, 
    TrashIcon,
    PlusIcon,
    ClockIcon,
    FileIcon,
    UserIcon,
    CheckCircleIcon,
    XCircleIcon,
    Clock4Icon
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export type Leave = {
    id: number;
    motivo: string;
    inicio: string;
    fim: string;
    justificativo: string | null;
    status: "pendente" | "aprovado" | "rejeitado";
    admin_comentario: string | null;
    created_at: string;
    por:string
    funcionario_nome: string;
};

function formatDate(dateString: string) {
    const d = new Date(dateString);
    return isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}



export default function DispensaFuncionario() {
    const userName = "Nome do Funcionário"; 
    const [dispensa, setdispensa] = useState<Leave[]>([]);
    const [motivo, setmotivo] = useState("");
    const [inicio, setinicio] = useState("");
    const [fim, setfim] = useState("");
    const [uploadcareFileUrl, setUploadcareFileUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("todos");
    const router = useRouter();

    const uploaderRef = useRef<any>(null);
    
    useEffect(() => {
        const uploader = uploaderRef.current;
        if (!uploader) return;

        const handleUploaderEvent = (event: any) => {
            const fileInfo = event.detail.allEntries[0]?.cdnUrl;
            if (fileInfo) {
                setUploadcareFileUrl(fileInfo);
            }
        };

        uploader.addEventListener('change', handleUploaderEvent);

        return () => {
            uploader.removeEventListener('change', handleUploaderEvent);
        };
    }, []);
    
    const filteredDispensas = dispensa.filter(item => {
        if (activeTab === "todos") return true;
        return item.status === activeTab;
    });

    const exportarPDF = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.setTextColor(15, 76, 129);
        doc.text('Relatório de Dispensas', 105, 15, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Funcionário: ${userName}`, 14, 25);
        doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 30);
        
        autoTable(doc, {
            head: [
                [
                    { content: 'Motivo', styles: { fillColor: [15, 76, 129], textColor: 255 } },
                    { content: 'Início', styles: { fillColor: [15, 76, 129], textColor: 255 } },
                    { content: 'Fim', styles: { fillColor: [15, 76, 129], textColor: 255 } },
                    { content: 'Duração', styles: { fillColor: [15, 76, 129], textColor: 255 } },
                    { content: 'Status', styles: { fillColor: [15, 76, 129], textColor: 255 } }
                ]
            ],
            body: dispensa.map(a => [
                a.motivo,
                formatDate(a.inicio),
                formatDate(a.fim),
                `${calculateDays(a.inicio, a.fim)} dias`,
                a.status.charAt(0).toUpperCase() + a.status.slice(1)
            ]),
            startY: 35,
            styles: { cellPadding: 3, fontSize: 10 },
            headStyles: { fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });
        
        doc.save(`dispensas-${userName}-${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    useEffect(() => {
        async function fetchDispensas() {
            try {
                const res = await fetch("http://localhost:8000/dispensa/my/", {
                    credentials:"include"
                });

                if (!res.ok) {
                    throw new Error(`Erro ${res.status}: ${res.statusText}`);
                }

                const json = await res.json();

                if (Array.isArray(json)) {
                    setdispensa(json);
                } else if (Array.isArray(json.message)) {
                    setdispensa(json.message);
                } else {
                    console.error("Formato inesperado:", json);
                    setdispensa([]);  
                }
            } catch (error) {
                console.error("Erro ao buscar dispensas:", error);
                setdispensa([]);  
            } finally {
                setLoading(false);
            }
        }
        fetchDispensas();
    }, []);

    const DeletarDados = async (pk: number) => {
        try {
            const result = await Swal.fire({
                title: 'Cancelar pedido?',
                text: "Esta ação não pode ser desfeita",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#0f4c81',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim, cancelar',
                cancelButtonText: 'Manter pedido'
            });

            if (result.isConfirmed) {
                const res = await fetch(`http://localhost:8000/deletar-dispensa/${pk}/`, {
                    method: "DELETE",
                });
                await res.json();
                setdispensa((prev) => prev.filter((item) => item.id !== pk));

                Swal.fire(
                    'Pedido cancelado!',
                    'Sua solicitação foi removida',
                    'success'
                );
            }
        } catch(err) {
            Swal.fire('Erro', 'Falha ao cancelar pedido', 'error');
        }
    }

    function calculateDays(start: string, end: string): number {
        const inicio = new Date(start);
        const fim = new Date(end);
        const diffTime = Math.abs(fim.getTime() - inicio.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return isNaN(diffDays) ? 0 : diffDays;
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        const hoje = new Date();
        const inicioDate = new Date(inicio);
        const fimDate = new Date(fim);
        
        if (inicioDate > fimDate) {
            return Swal.fire("Erro", "A data de início não pode ser posterior à data de término", "error");
        }
        
        if (inicioDate < hoje) {
            return Swal.fire("Erro", "Selecione uma data atual ou futura para início", "warning");
        }
        
        if (calculateDays(inicio, fim) > 30) {
            return Swal.fire("Limite excedido", "Dispensas não podem exceder 30 dias", "warning");
        }

        const payload = {
            motivo,
            inicio,
            fim,
            justificativo: uploadcareFileUrl,
        };
        try {
            const res = await fetch("http://localhost:8000/dispensas/criar/", {
                method: "POST",
                credentials:"include",
                headers: { 
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Erro do servidor:", errorData);
                return Swal.fire("Erro", `Falha ao enviar pedido: ${JSON.stringify(errorData.detail || errorData)}`, "error");
            }
            
            const json = await res.json();
            setdispensa((prev) => [json, ...prev]);
            setmotivo(""); 
            setinicio(""); 
            setfim(""); 
            setUploadcareFileUrl(null);
            
            Swal.fire({
                icon: "success",
                title: "Pedido enviado!",
                text: "Sua solicitação está em análise",
                showConfirmButton: false,
                timer: 2000
            });
        } catch (error) {
            Swal.fire("Erro", "Falha na comunicação com o servidor", "error");
        }
    };

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case "aprovado":
            return (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Aprovado
                </Badge>
            );
            case "rejeitado":
            return (
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    Rejeitado
                </Badge>
            );
            default:
            return (
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    <Clock4Icon className="h-4 w-4 mr-1" />
                    Pendente
                </Badge>
            );
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                    <CalendarIcon className="h-8 w-8 text-blue-600" />
                    Solicitações de Dispensa
                </h1>
                <p className="text-gray-600 mt-2">
                    Gerencie suas dispensas e acompanhe o status das solicitações
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PlusIcon className="h-5 w-5 text-blue-600" />
                            Nova Solicitação
                        </CardTitle>
                        <CardDescription>
                            Preencha os detalhes para solicitar uma dispensa
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="motivo">Motivo da Dispensa</Label>
                                <Input
                                    id="motivo"
                                    value={motivo}
                                    onChange={(e) => setmotivo(e.target.value)}
                                    placeholder="Descreva o motivo da dispensa"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="inicio">Data Início</Label>
                                    <Input 
                                        id="inicio"
                                        type="date" 
                                        value={inicio} 
                                        onChange={(e) => setinicio(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fim">Data Término</Label>
                                    <Input 
                                        id="fim"
                                        type="date" 
                                        value={fim} 
                                        onChange={(e) => setfim(e.target.value)} 
                                        required 
                                    />
                                </div>
                            </div>

                            {inicio && fim && (
                                <div className="flex items-center gap-2 text-sm bg-blue-50 p-3 rounded-lg">
                                    <ClockIcon className="h-4 w-4 text-blue-600" />
                                    <span>
                                        Duração: <strong>{calculateDays(inicio, fim)} dias</strong>
                                    </span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="documento">Documento de Apoio (Opcional)</Label>
                                <div className="flex items-center gap-3">
                                    <FileUploaderRegular
                                        pubkey="41450941b70f42384f1f"
                                    />
                                </div>
                            </div>

                            <Button 
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                                type="submit"
                            >
                                Enviar Solicitação
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Lista de solicitações */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <FileTextIcon className="h-5 w-5 text-blue-600" />
                                    Histórico de Solicitações
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    Todas as suas dispensas solicitadas
                                </CardDescription>
                            </div>
                            
                            <Button 
                                variant="outline" 
                                onClick={exportarPDF}
                                className="flex items-center gap-2"
                            >
                                <DownloadIcon className="h-4 w-4" />
                                Exportar PDF
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid grid-cols-4 bg-gray-100">
                                <TabsTrigger value="todos">Todos</TabsTrigger>
                                <TabsTrigger value="pendente">Pendentes</TabsTrigger>
                                <TabsTrigger value="aprovado">Aprovados</TabsTrigger>
                                <TabsTrigger value="rejeitado">Rejeitados</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <div className="mt-4 border rounded-lg overflow-hidden">
                                <Table className="min-w-full">
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableHead className="w-[25%]">Motivo</TableHead>
                                            <TableHead>Período</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Documento</TableHead>
                                            <TableHead className="whitespace-nowrap">Aprovado/Rejeito Por:</TableHead>

                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredDispensas.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <CalendarIcon className="h-12 w-12 text-gray-400 mb-3" />
                                                        <h3 className="font-medium text-gray-900">Nenhuma dispensa encontrada</h3>
                                                        <p className="text-gray-500">
                                                            {activeTab === "todos" 
                                                            ? "Você ainda não solicitou dispensas" 
                                                            : `Nenhuma dispensa ${activeTab} encontrada`}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredDispensas.map((l) => (
                                                <TableRow key={l.id} className="hover:bg-gray-50">
                                                    <TableCell className="font-medium">{l.motivo}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span>{formatDate(l.inicio)}</span>
                                                            <span className="text-xs text-gray-500">até {formatDate(l.fim)}</span>
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <ClockIcon className="h-3 w-3 text-gray-500" />
                                                                <span className="text-xs text-gray-500">
                                                                    {calculateDays(l.inicio, l.fim)} dias
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {renderStatusBadge(l.status)}
                                                        {l.admin_comentario && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {l.admin_comentario}
                                                            </p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {l.justificativo ? (
                                                            <a 
                                                                href={l.justificativo} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline flex items-center gap-1"
                                                            >
                                                                <FileIcon className="h-4 w-4" />
                                                                Visualizar
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-400">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {l.por }
                                                    </TableCell>
                                                    <TableCell>
                                                        {l.status === 'pendente' && (
                                                            <Button 
                                                                variant="destructive" 
                                                                size="sm"
                                                                onClick={() => DeletarDados(l.id)}
                                                                className="flex items-center gap-1"
                                                            >
                                                                <TrashIcon className="h-4 w-4" />
                                                                Cancelar
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
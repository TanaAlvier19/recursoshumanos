'use client';
import dynamic from "next/dynamic";
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';


type DataItem = {
  departamento: string;
  presencas: number;
};

const AdminDashboard = () => {
  const { accessToken, userName, userLoading } = useContext(AuthContext);
  const router = useRouter();
  const [funcionarios, setFuncionarios] = useState(0);
  const [totalDispensas, setTotalDispensas] = useState([]);
  const [totalPresencas, setTotalPresencas] = useState(0);
  const [departamentos, setDepartamentos] = useState(0);
  const [nomeDepartamento, setNomeDepartamento] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DataItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resFuncionarios, resDispensas, resTables, resPresencas] = await Promise.all([
          fetch('https://backend-django-2-7qpl.onrender.com/api/funcionarios/all/', {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch('https://backend-django-2-7qpl.onrender.com/api/leaves/all/', {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch('https://backend-django-2-7qpl.onrender.com/tables/'),
          fetch('https://backend-django-2-7qpl.onrender.com/api/assiduidade/todos/', {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);

        const funcionariosData = await resFuncionarios.json();
        const dispensaJson = await resDispensas.json();
        const tablesJson = await resTables.json();
        const presencas = await resPresencas.json();

        const nomesFuncionarios = funcionariosData.map((f: any) => f.nome?.trim().toLowerCase());

        const presencasComNomesNorm = presencas.map((p: any) => ({
          ...p,
          nome: p.funcionario_nome?.trim().toLowerCase(),
        }));

        const resultados: DataItem[] = await Promise.all(
          tablesJson.tables.map(async (table: string) => {
            const res = await fetch(`https://backend-django-2-7qpl.onrender.com/tables/${table}/data/`);
            const tableData = await res.json();

            const nomesNoDepartamento = tableData.rows
              .map((row: any) => row.nome?.trim().toLowerCase())
              .filter((nome: string | undefined) => nome && nomesFuncionarios.includes(nome));

            const presencasNoDepartamento = presencasComNomesNorm.filter((p: any) =>
              nomesNoDepartamento.includes(p.nome)
            );

            console.log(`📊 Departamento: ${table}`);
            console.log(`✔️ Presenças encontradas: ${presencasNoDepartamento.length}`);
            presencasNoDepartamento.forEach((p: any) => {
              console.log(`   - ${p.nome}`);
            });

            return {
              departamento: table,
              presencas: presencasNoDepartamento.length,
            };
          })
        );

        setData(resultados);
        setNomeDepartamento(tablesJson.tables);
        setFuncionarios(funcionariosData.length || 0);
        setTotalDispensas(dispensaJson.message?.length || 0);
        setDepartamentos(tablesJson.tables?.length || 0);
        setTotalPresencas(presencas.length || 0);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar os dados:', error);
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchData();
    }
  }, [accessToken]);

  useEffect(() => {
    if (!userLoading && !accessToken) {
      router.push("/logincomsenha");
    }
  }, [accessToken, userLoading, router]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-8">
      <h1 className="lg:text-2xl font-bold text-blue-500">Painel Administrativo</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="bg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[{ label: 'Cadastrados', value: funcionarios, color: 'blue' },
              { label: 'Departamentos', value: departamentos, color: 'green' },
              { label: 'Presenças', value: totalPresencas, color: 'red' },
              { label: 'Dispensas', value: totalDispensas, color: 'yellow' }].map((item, idx) => (
              <div
                key={idx}
                className={`bg-white p-4 rounded-lg md:flex-col shadow-md border-l-4 border-${item.color}-500`}
              >
                <h2 className="lg:text-gray-500">{item.label}</h2>
                <p className={`text-2xl font-bold text-${item.color}-600`}>{item.value}</p>
              </div>
            ))}
          </div>

          <div className="w-full h-80 bg-white p-4 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Assiduidade por Departamento
            </h2>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="departamento" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="presencas" name="Presenças" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

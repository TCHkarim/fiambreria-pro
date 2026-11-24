import React, { useState } from 'react';
import {
  CircleDollarSign,
  Plus,
  Search,
  MessageCircle,
  FileText,
  CreditCard,
  Building,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Filter,
  X,
  Check
} from 'lucide-react';
import { Cobranza, Cheque } from '../../types';
import { store } from '../../services/store';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { generateReciboPDF } from '../../services/pdfService';
import { sendCobranzaReminderWhatsApp } from '../../services/whatsappService';

export const CobranzasView: React.FC = () => {
  const state = store.getState();
  const [activeTab, setActiveTab] = useState<'cobranzas' | 'cuentas' | 'cheques'>('cobranzas');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewCobranzaModal, setShowNewCobranzaModal] = useState(false);
  const [showNewChequeModal, setShowNewChequeModal] = useState(false);

  // Estados nueva cobranza
  const [clientId, setClientId] = useState(state.clientes[0]?.id || '');
  const [amount, setAmount] = useState(150000);
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia' | 'cheque' | 'mercado_pago'>('transferencia');
  const [reference, setReference] = useState('TRANSF-BANCO-');
  const [notes, setNotes] = useState('Cancelación parcial de saldo');

  // Estados nuevo cheque
  const [checkNum, setCheckNum] = useState('');
  const [checkBank, setCheckBank] = useState('Banco Galicia');
  const [checkDrawer, setCheckDrawer] = useState('');
  const [checkAmount, setCheckAmount] = useState(250000);
  const [checkDueDate, setCheckDueDate] = useState(
    new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10)
  );
  const [checkType, setCheckType] = useState<'echeq' | 'fisico'>('echeq');

  const selectedClient = state.clientes.find(c => c.id === clientId);

  const handleCobranzaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    store.addCobranza({
      client_id: selectedClient.id,
      client_name: selectedClient.fantasy_name || selectedClient.business_name,
      date: new Date().toISOString().slice(0, 10),
      amount,
      payment_method: paymentMethod,
      reference_number: reference,
      notes
    });
    setShowNewCobranzaModal(false);
  };

  const handleChequeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    store.addCheque({
      check_number: checkNum || `CHQ-${Date.now().toString().slice(-6)}`,
      bank: checkBank,
      drawer_cuit: selectedClient.cuit,
      drawer_name: selectedClient.business_name,
      client_id: selectedClient.id,
      client_name: selectedClient.fantasy_name || selectedClient.business_name,
      amount: checkAmount,
      issue_date: new Date().toISOString().slice(0, 10),
      due_date: checkDueDate,
      type: checkType,
      status: 'en_cartera'
    });
    setShowNewChequeModal(false);
  };

  // Cartera de cheques
  const chequesEnCartera = state.cheques.filter(c => c.status === 'en_cartera');
  const totalChequesCartera = chequesEnCartera.reduce((acc, c) => acc + c.amount, 0);

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 tracking-tight">
            Cobranzas, Cuentas Corrientes y Cheques
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Gestión de pagos de clientes, recibos oficiales X en PDF, cartera de eCheqs y recordatorios por WhatsApp
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowNewChequeModal(true)}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-semibold transition flex items-center space-x-1"
          >
            <CreditCard className="w-4 h-4 text-purple-600" />
            <span>Ingresar Cheque</span>
          </button>

          <button
            onClick={() => setShowNewCobranzaModal(true)}
            className="px-4 py-2 bg-[#781d28] hover:bg-[#5c121c] text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Cobranza</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-stone-200 dark:border-stone-800 pb-2">
        {[
          { id: 'cobranzas', label: 'Cobranzas y Recibos Emitidos' },
          { id: 'cuentas', label: 'Cuentas Corrientes de Clientes' },
          { id: 'cheques', label: `Cartera de Cheques & eCheqs (${chequesEnCartera.length})` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === t.id
                ? 'bg-[#781d28] text-white shadow-xs'
                : 'bg-white dark:bg-[#201d1c] text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:bg-stone-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: COBRANZAS Y RECIBOS */}
      {activeTab === 'cobranzas' && (
        <div className="bg-white dark:bg-[#201d1c] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden animate-in fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf6f0] dark:bg-stone-800/60 uppercase text-[10px] font-semibold text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="py-3 px-4">Recibo N° / Fecha</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Monto Cobrado</th>
                  <th className="py-3 px-4">Medio de Pago</th>
                  <th className="py-3 px-4">Referencia / Comprobante</th>
                  <th className="py-3 px-4">Concepto</th>
                  <th className="py-3 px-4 text-right">Recibo PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                {state.cobranzas.map((cob) => {
                  const client = state.clientes.find(c => c.id === cob.client_id);
                  return (
                    <tr key={cob.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#781d28] dark:text-[#f8a5af]">
                        {cob.receipt_number}
                        <span className="block text-[10px] text-stone-400 font-normal">{formatDate(cob.date)}</span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-stone-100">
                        {cob.client_name}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {formatCurrency(cob.amount)}
                      </td>

                      <td className="py-3.5 px-4 capitalize text-stone-700 dark:text-stone-300">
                        {cob.payment_method.replace('_', ' ')}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-stone-500">
                        {cob.reference_number || '-'}
                      </td>

                      <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400 text-[11px]">
                        {cob.notes || 'Cancelación de saldo'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => generateReciboPDF(cob, client, state.empresa)}
                          title="Descargar Recibo X Oficial en PDF"
                          className="p-1.5 text-[#781d28] dark:text-[#f8a5af] hover:bg-[#781d28]/10 rounded-lg transition"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CUENTAS CORRIENTES */}
      {activeTab === 'cuentas' && (
        <div className="bg-white dark:bg-[#201d1c] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden animate-in fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf6f0] dark:bg-stone-800/60 uppercase text-[10px] font-semibold text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="py-3 px-4">Cliente / Razón Social</th>
                  <th className="py-3 px-4">Zona</th>
                  <th className="py-3 px-4">Límite Aprobado</th>
                  <th className="py-3 px-4">Saldo Deudor Actual</th>
                  <th className="py-3 px-4">Estado Cuenta</th>
                  <th className="py-3 px-4 text-right">Acción WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                {state.clientes.map((cli) => {
                  const hasDebt = cli.balance > 0;
                  const isCritical = cli.balance > cli.credit_limit;

                  return (
                    <tr key={cli.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-stone-900 dark:text-stone-100 block">{cli.fantasy_name || cli.business_name}</span>
                        <span className="font-mono text-[10px] text-stone-400">CUIT: {cli.cuit}</span>
                      </td>

                      <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400">{cli.zone}</td>

                      <td className="py-3.5 px-4 font-mono text-stone-600 dark:text-stone-300">
                        {formatCurrency(cli.credit_limit)}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-sm">
                        <span className={hasDebt ? 'text-[#781d28] dark:text-[#f8a5af]' : 'text-emerald-600'}>
                          {formatCurrency(cli.balance)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isCritical ? 'bg-rose-100 text-rose-800 animate-pulse' :
                          hasDebt ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isCritical ? 'Límite Excedido' : hasDebt ? 'Saldo Pendiente' : 'Al Día'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {hasDebt && (
                          <button
                            onClick={() => sendCobranzaReminderWhatsApp(cli, state.empresa)}
                            className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ml-auto"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Recordatorio CBU</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CARTERA DE CHEQUES */}
      {activeTab === 'cheques' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Banner Resumen */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-200">
                Total en Cartera de Cheques & eCheqs
              </span>
              <p className="text-2xl font-serif font-bold mt-1">{formatCurrency(totalChequesCartera)}</p>
              <p className="text-xs text-purple-200 mt-0.5">Disponibles para depósito o endoso a proveedores</p>
            </div>
            <CreditCard className="w-10 h-10 text-purple-300 opacity-60" />
          </div>

          <div className="bg-white dark:bg-[#201d1c] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#faf6f0] dark:bg-stone-800/60 uppercase text-[10px] font-semibold text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="py-3 px-4">N° Cheque / Banco</th>
                    <th className="py-3 px-4">Cliente / Librador</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Monto</th>
                    <th className="py-3 px-4">Fecha de Cobro</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Operar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                  {state.cheques.map((chq) => (
                    <tr key={chq.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                      <td className="py-3.5 px-4">
                        <span className="font-bold font-mono text-stone-900 dark:text-stone-100 block">{chq.check_number}</span>
                        <span className="text-[10px] text-stone-400">{chq.bank}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-stone-800 dark:text-stone-200 block">{chq.client_name}</span>
                        <span className="text-[10px] text-stone-400 font-mono">CUIT: {chq.drawer_cuit}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono uppercase text-stone-600 dark:text-stone-300">
                        {chq.type}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-sm text-stone-900 dark:text-stone-100">
                        {formatCurrency(chq.amount)}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-stone-800 dark:text-stone-200">
                        {formatDate(chq.due_date)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          chq.status === 'en_cartera' ? 'bg-purple-100 text-purple-800' :
                          chq.status === 'depositado' ? 'bg-blue-100 text-blue-800' :
                          chq.status === 'cobrado' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                        }`}>
                          {chq.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {chq.status === 'en_cartera' && (
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => store.updateChequeStatus(chq.id, 'depositado')}
                              className="px-2 py-1 text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                            >
                              Depositar
                            </button>
                            <button
                              onClick={() => store.updateChequeStatus(chq.id, 'endosado', 'Frigorífico Los Pampas')}
                              className="px-2 py-1 text-[10px] font-bold bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-lg transition"
                            >
                              Endosar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Registrar Cobranza */}
      {showNewCobranzaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#201d1c] w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
            <div className="px-6 py-4 bg-[#781d28] text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base">Registrar Cobranza Oficial</h3>
                <p className="text-xs text-white/80">Emisión de Recibo X e imputación en cuenta corriente</p>
              </div>
              <button onClick={() => setShowNewCobranzaModal(false)} className="p-1 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCobranzaSubmit} className="p-6 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Cliente
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                >
                  {state.clientes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.fantasy_name || c.business_name} (Saldo: {formatCurrency(c.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Monto Cobrado ($ ARS)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="100"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Medio de Cobro
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  >
                    <option value="transferencia">Transferencia Bancaria</option>
                    <option value="efectivo">Efectivo en Mano</option>
                    <option value="cheque">Cheque Físico / eCheq</option>
                    <option value="mercado_pago">Mercado Pago</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  N° de Comprobante / Referencia Bancaria
                </label>
                <input
                  type="text"
                  placeholder="Ej: TRANSF-SANTANDER-4819"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Concepto / Observaciones
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-700 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewCobranzaModal(false)}
                  className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#781d28] hover:bg-[#5c121c] rounded-xl shadow-sm"
                >
                  Emitir Recibo y Aplicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ingresar Cheque */}
      {showNewChequeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#201d1c] w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
            <div className="px-6 py-4 bg-purple-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base">Ingresar Cheque a Cartera</h3>
                <p className="text-xs text-white/80">Registro de cheque de pago diferido o eCheq</p>
              </div>
              <button onClick={() => setShowNewChequeModal(false)} className="p-1 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChequeSubmit} className="p-6 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Cliente que entrega el Cheque
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                >
                  {state.clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.fantasy_name || c.business_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    N° de Cheque
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CHQ-894120"
                    value={checkNum}
                    onChange={(e) => setCheckNum(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Banco Emisor
                  </label>
                  <input
                    type="text"
                    value={checkBank}
                    onChange={(e) => setCheckBank(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Monto ($ ARS)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={checkAmount}
                    onChange={(e) => setCheckAmount(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Tipo de Cheque
                  </label>
                  <select
                    value={checkType}
                    onChange={(e: any) => setCheckType(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  >
                    <option value="echeq">eCheq Digital</option>
                    <option value="fisico">Cheque en Papel Físico</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Fecha de Cobro / Vencimiento
                </label>
                <input
                  type="date"
                  required
                  value={checkDueDate}
                  onChange={(e) => setCheckDueDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-700 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewChequeModal(false)}
                  className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-900 hover:bg-purple-950 rounded-xl shadow-sm"
                >
                  Guardar en Cartera
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

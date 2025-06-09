export interface Carteira {
  id: string
  nome: string
  saldo: number
  idUsuarioPrincipal: string
  membros: string[]
  tipo: 'casa'
}

export interface Caixinha {
  id: string
  nome: string
  saldo: number
  idUsuarioPrincipal: string
  idCarteiraAssociada?: string
  membros: string[]
  tipo: 'viagem' | 'reforma' | 'geral' | 'outros'
}

export interface Transaction {
  id: string
  idFundo: string
  tipoFundo: 'carteira' | 'caixinha'
  idUsuario: string
  valor: number
  tipo: 'ganho' | 'despesa' | 'transferencia'
  descricao: string
  categoriaNome: string
  dataTransacao: string
  idFundoDestino?: string
}

export type Fund = Carteira | Caixinha

# 📖 Manual de Instalação e Execução - Novo Álbum 2.0

Este documento explica o passo a passo para rodar a aplicação do Álbum de Figurinhas em um computador novo (ou após formatar o seu).

## 1. Pré-requisitos (O que você precisa instalar primeiro)
O computador novo precisará ter o **Node.js** instalado. Ele é o "motor" necessário para rodar e construir projetos modernos de React.

1. Acesse o site oficial: [https://nodejs.org](https://nodejs.org)
2. Baixe e instale a versão **LTS (Long Term Support)** recomendada para a maioria dos usuários.
3. Para garantir que instalou corretamente, abra o Prompt de Comando (Terminal) e digite:
   ```bash
   node -v
   npm -v
   ```
   *(Se ele responder com números de versão, deu tudo certo!)*

## 2. Movendo o Projeto
Transfira esta pasta completa (`NovoAlbum2.0`) para o computador novo usando um Pen Drive, HD Externo, Google Drive ou GitHub.
> ⚠️ **Dica:** Se a pasta estiver muito pesada, você pode apagar a subpasta `node_modules` antes de copiar. Nós vamos recriá-la no próximo passo de qualquer forma.

## 3. Instalando as Dependências (Modo Automático)
Para não ter que digitar nenhum código, nós criamos um instalador automático!
1. Dê um clique duplo no arquivo **`manager.bat`** (ele está dentro da pasta do álbum).
2. O painel do gerenciador vai se abrir. Digite a opção **`4`** e aperte Enter (**Instalar / Preparar Novo Computador**).
3. Ele vai verificar automaticamente se você realmente instalou o Node.js. Se estiver tudo certo, ele vai baixar e instalar todas as peças do quebra-cabeça que o projeto usa.
4. Aguarde a mensagem de "Instalação concluída com sucesso!".

## 4. Abrindo o Álbum
Com tudo instalado, ligar o álbum agora também é em apenas um clique:
1. Dê um clique duplo no **`manager.bat`** novamente (ou continue na janela que já estava aberta).
2. Digite a opção **`3`** e aperte Enter (**Reiniciar Servidor e Abrir Navegador**).
3. Magia! Ele vai ligar o servidor por baixo dos panos e já vai abrir o seu navegador padrão no endereço correto (**`http://localhost:10000/`**).
- O seu álbum está rodando!

---

## 💾 Sobre os Seus Dados e Figurinhas Coladas
Toda a inteligência de banco de dados do álbum (O armazenamento do IndexedDB / Dexie.js) fica **salva dentro do seu navegador atual**. 

Isso significa que, ao abrir no computador novo, a tela inicial estará "zerada". **Para não perder sua coleção, faça o seguinte:**
1. No computador ANTIGO, abra o álbum e clique no ícone de Backup (Disquete/Download) na barra superior.
2. Ele vai baixar um arquivo `.json` com todo o seu progresso e imagens Base64.
3. Leve esse arquivo para o computador NOVO.
4. Na tela inicial do computador novo, clique no botão **Carregar JSON** (localizado no canto superior direito) e jogue o arquivo lá.
5. Magia! Todo o seu estoque, raridades e figurinhas coladas vão renascer exatamente como estavam.

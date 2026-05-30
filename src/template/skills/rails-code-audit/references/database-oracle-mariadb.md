# Banco de Dados — Oracle e MariaDB/MySQL no Rails

Detecte o adapter primeiro (`config/database.yml` + `Gemfile`):

- **Oracle**: `oracle-enhanced`, `ruby-oci8`/`ruby-oci8`-less, adapter
  `oracle_enhanced`.
- **MariaDB/MySQL**: `mysql2` ou `trilogy`, adapter `mysql2`/`trilogy`.

Aplique a seção correspondente. As regras de performance (N+1, índices) valem
para os dois.

---

## A. Comum aos dois bancos

### A.1 N+1 queries
Query dentro de iteração sobre uma associação:

```ruby
# N+1
@posts.each { |p| puts p.author.name }
# Correto
@posts = Post.includes(:author)
```

Procure `.each`/`.map` acessando associação sem `includes`/`preload`/`eager_load`.
Recomende o uso de `bullet` (gem) em desenvolvimento como melhoria estrutural.

### A.2 Índices ausentes
- Toda foreign key (`*_id`) deve ter índice. Cheque o `schema.rb`/`structure.sql`.
- Colunas usadas em `where`/`order`/`join` frequentes sem índice.
- Unique constraint apenas via validação Rails (`validates :uniqueness`) **sem**
  unique index no banco → race condition e duplicados. Sinalize como ALTO.

### A.3 Migrations perigosas em tabela grande
- Adicionar coluna `NOT NULL` com default em tabela grande pode travar (varia
  por versão/banco).
- Criar índice sem concorrência bloqueia escrita. No Postgres seria
  `algorithm: :concurrently`; em MySQL/MariaDB e Oracle avalie janela de
  manutenção / online DDL.
- Migration sem `down`/irreversível sem `reversible` declarado.

### A.4 Tipos e precisão
- Dinheiro como `float` → erro de arredondamento. Use `decimal` com
  `precision`/`scale`.
- Datas sem timezone; uso de `Time.now` em vez de `Time.current`.

### A.5 Locking e transação
- Operação multi-passo de dinheiro/saldo sem `transaction` nem
  `with_lock`/`lock!` → corrida.
- Transações longas envolvendo chamada HTTP externa (segura conexão e pode dar
  deadlock).
- `find_or_create_by` sem unique index (ver A.2).

---

## B. Específico de ORACLE

### B.1 Limite de identificadores
Oracle < 12.2 limita nomes de tabela/coluna/índice a **30 caracteres**; 12.2+
a 128. Rails gera nomes longos para índices/constraints automaticamente:

```ruby
add_index :pedidos_itens_historico, [:pedido_id, :produto_id]
# nome auto pode estourar 30 chars no Oracle antigo → ORA-00972
```

Sinalize tabelas/índices/FKs com nome longo e recomende `name:` explícito e
curto em `add_index`/`add_reference`.

### B.2 Sequences e chaves primárias
- `oracle-enhanced` usa sequences/triggers para auto-increment. Verifique se
  inserts manuais via SQL respeitam a sequence.
- IDs assumidos como autoincrement contínuo: não garanta isso.

### B.3 Maiúsculas / aspas em identificadores
Oracle armazena identificadores em maiúsculas. Queries SQL cruas com nomes
entre aspas em minúsculo quebram. Prefira ActiveRecord; em SQL cru, cuidado
com case.

### B.4 `LIMIT`/paginação
Oracle não tem `LIMIT` nativo até 12c (usa `ROWNUM`/`FETCH FIRST`). Confie no
ActiveRecord (`limit`/`offset`); sinalize SQL cru usando `LIMIT` literal contra
Oracle.

### B.5 Tipos
- `String` mapeia para `VARCHAR2`; cuidado com limites (4000 bytes em coluna
  até versões recentes).
- Boolean: Oracle não tem boolean nativo histórico; `oracle-enhanced`
  emula (NUMBER(1)/CHAR). Verifique comparações com `true/false` em SQL cru.
- `CLOB`/`BLOB` para texto/binário grande; sinalize `text` sem considerar isso.

### B.6 NULL vs string vazia
**Oracle trata `''` como `NULL`.** Validações/queries que dependem de string
vazia diferente de NULL comportam-se diferente de MySQL. Sinalize lógica que
assume `'' != NULL`.

### B.7 Distinção de ferramentas
Brakeman/RuboCop funcionam normal; mas plugins de schema podem assumir
Postgres/MySQL. Verifique se `schema_format` é `:sql` (`structure.sql`) — é o
recomendado para Oracle por causa de objetos não suportados em `schema.rb`.

---

## C. Específico de MARIADB / MYSQL

### C.1 Charset e collation
- Tabela/coluna não usando `utf8mb4` → emojis e alguns caracteres quebram
  (`utf8` do MySQL é 3-byte, incompleto). Sinalize `utf8`/`latin1` em colunas
  de texto de usuário.
- Collation inconsistente entre colunas usadas em JOIN → erro
  "Illegal mix of collations" ou índice ignorado.

### C.2 Tamanho de índice / chave
- Índice em coluna `string` longa com `utf8mb4` pode estourar limite de bytes
  do índice. Verifique índices em VARCHAR grandes; sugira limitar tamanho
  (`length:` no `add_index`).

### C.3 STRICT mode
- `database.yml` sem `strict: true` → MySQL silenciosamente trunca/aceita
  dados inválidos (datas zero, string longa demais). Recomende strict mode.

### C.4 Tipos
- `boolean` é `TINYINT(1)` — ok com Rails, mas SQL cru comparando com
  `'true'` string falha.
- Dinheiro como `float`/`double` → use `DECIMAL`.
- `DATETIME` vs `TIMESTAMP` (range e timezone diferentes); atenção ao ano 2038
  em `TIMESTAMP`.
- `enum` de coluna MySQL vs enum ActiveRecord: não confundir.

### C.5 Migrations online
- `ALTER TABLE` em tabela grande bloqueia dependendo da versão/engine. Avalie
  `ALGORITHM=INPLACE`/`LOCK=NONE` ou ferramentas (gh-ost/pt-osc) como
  recomendação estrutural.
- Engine deve ser InnoDB (transações/FK). Sinalize MyISAM em tabela
  transacional.

### C.6 Foreign keys reais
Confirme que FKs existem no banco (`add_foreign_key`), não só associação
Rails — integridade referencial sem FK fica só na aplicação.

### C.7 `GROUP BY` e `ONLY_FULL_GROUP_BY`
MySQL/MariaDB recente reativa `ONLY_FULL_GROUP_BY`. Queries com `group` +
colunas não agregadas que funcionavam antes podem quebrar. Sinalize SQL cru
ou `group` frágil.

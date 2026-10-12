from rest_framework.pagination import PageNumberPagination


class PaginacaoPadrao(PageNumberPagination):
    """Paginação padrão de toda listagem da API (issue #121).

    Sem ela, qualquer `GET` de lista devolvia a tabela inteira — com o efetivo
    de uma instituição, isso é lento e expõe mais dado do que a tela precisa.

    Contrato (o mesmo que o componente `Paginacao` do frontend consome):
    `?page=N&page_size=M` → `{count, next, previous, results}`. `page_size` é
    limitado por `max_page_size` para ninguém pedir a tabela inteira de volta.
    """

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100

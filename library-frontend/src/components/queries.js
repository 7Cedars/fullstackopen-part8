import { gql } from '@apollo/client'

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
      id
    }
  }
`
export const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      author {
        name
        id
      }
      published
      id
    }
  }
`

export const CREATE_BOOK = gql`
  mutation createNewBook($title: String!, $author: String!, $published: Int!, $genres: [String]!) {
    addBook(
      title: $title,
      author: $author,
      published: $published,
      genres: $genres
    ) {
      title,
      author,
      id
    }
  }
`

export const EDIT_AUTHOR = gql`
  mutation createNewBook($name: String!, $setBornTo: Int!) {
    editAuthor(
      name: $name
      setBornTo: $setBornTo
    ) {
      name,
      id
    }
  }
`



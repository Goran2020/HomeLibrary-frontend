import React from 'react';
import { Container, Card, Row, Col, Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CategoryType from '../../types/CategoryType';
import { faListAlt, faSearch } from '@fortawesome/free-solid-svg-icons';
import api, { ApiResponse } from '../../api/api';
import BookType from '../../types/BookType';
import { Redirect, Link } from 'react-router-dom';
import { ApiConfig } from '../../config/api.config';

interface CategoryPageProperties {
    match: {
        params: {
            cId: number;
        }
    }
}

interface CategoryPageState {
    isUserLoggedIn?: boolean;
    category?: CategoryType;
    books?: BookType[];
    message?: string;
    filters: {
        keywords: string;
        title: string;
        order: "title asc" | "title desc" | "authors acs";
    };
}

interface BookDto {
    bookId: number;
    title: string;
    originalTitle: string;
    publicationYear: number;
    pages: number;
    isbn: string;
    language: string;
    catalogNumber: string;
    photos: {
        cover: string;
        imagePath: string;
    }[];
    
}

export default class CategoryPage extends React.Component<CategoryPageProperties> {
    state: CategoryPageState;

    constructor(props: Readonly<CategoryPageProperties>) {
        super(props);

        this.state = {
            isUserLoggedIn: true,
            message: '',
            books: [],
            filters: {
                keywords: '',
                title: '',
                order: 'title asc',
            }

        };
    };   

    render() {
        if (this.state.isUserLoggedIn === false) {        
            return (
                <Redirect to="/login" />
            );
        }
        return (
            <Container>
                <Card>
                    <Card.Body>
                        <Card.Title>
                            <FontAwesomeIcon icon={ faListAlt } /> { this.state.category?.name }
                        </Card.Title>
                        
                            { this.printOptionalMessage() }
                        <Row>
                            <Col xs="12" md="4" lg="3">
                                { this.printFilters() }
                            </Col>
                            <Col xs="12" md="8" lg="9">
                            { this.showBooks() }
                            </Col>
                        </Row>                       
                    </Card.Body>
                </Card>
            </Container>
        );

        
    }

    private setNewFilter(filter: any) {
        this.setState(Object.assign(this.state, {
            filter: this.setNewFilter,
        }))
    }

    private filterKeywordsChanged(event: React.ChangeEvent<HTMLInputElement>) {        
        this.setNewFilter(Object.assign(this.state.filters, {
            keywords: event.target.value,
        }));
    }

    private filterTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setNewFilter(Object.assign(this.state.filters, {
            title: event.target.value,
        }));
    }

    private filterOrderChanged(event: React.ChangeEvent<HTMLSelectElement>) {
        this.setNewFilter(Object.assign(this.state.filters, {
            order: event.target.value,
        }));
    }

    private filterApplay() {
        this.getCategoryData();
    }

    private printFilters() {
        return (
            <>
               <Form.Group>
                   <Form.Label htmlFor="keywords">Keywords</Form.Label> <FontAwesomeIcon icon={ faSearch } />
                   <Form.Control type="text" 
                                 id="keywords" 
                                 value={ this.state.filters?.keywords } 
                                 onChange={ (e) => this.filterKeywordsChanged(e as any) }/>
               </Form.Group>
               <Form.Group>
                   <Row>
                       <Col xs="12" sm="12">
                            <Form.Label htmlFor="title">Title</Form.Label> <FontAwesomeIcon icon={ faSearch } />
                           <Form.Control type="text" 
                                         id="title" 
                                         value={ this.state.filters?.title } 
                                         onChange={ (e) => this.filterTitleChange(e as any) } />
                       </Col>
                   </Row>
               </Form.Group>
               <Form.Group>
                   <Form.Control as="select" id="sordOrder"
                                 value={ this.state.filters?.order }
                                 onChange={ (e) => this.filterOrderChanged(e as any) }>
                       <option value="title asc">Sort by Title - asc</option>
                       <option value="title desc">Sort by Title - desc</option>
                       <option value="year asc">Sort by Publication year - asc</option>
                       <option value="year desc">Sort by Publication year - desc</option>
                   </Form.Control>
               </Form.Group>
               <Form.Group>
                   <Button variant="primary" block onClick={() => this.filterApplay() }>
                       Start search
                   </Button>
               </Form.Group>
            </>
        )
    }

    private setLoggedInState(state: boolean) {
        this.setState(Object.assign(this.state, {
            isUserLoggedIn: state,
        }));
    }

    private printOptionalMessage() {
        if (this.state.message === '') {
            return;
        }

        return (
            <Card.Text>
                { this.state.message }
            </Card.Text>
        );
    }

    componentDidMount() {
        this.getCategoryData();
    }

    componentDidUpdate(oldProperties: CategoryPageProperties) {
        if (oldProperties.match.params.cId === this.props.match.params.cId) {
            return;
        }
        
        this.getCategoryData();
    }

    private setBooks(books: BookType[]) {
        this.setState(Object.assign(this.state, {
            books: books,
        }));
    }

    private setMessage(message: string) {
        this.setState(Object.assign(this.state, {
            message: message,
        }));
    }

    private setCategoryData(category: CategoryType) {
        this.setState(Object.assign(this.state, {
            category: category,
        }));
    }

    private singleBook(book: BookType) {
        return (
            <Col xs="12" sm="6" md="6" lg="4">
                <Card className="mt-3">
                    <Card.Header>
                        <img alt={ book.title } src= { ApiConfig.PHOTO_PATH + 'small/' +  book.imageFront} 
                        className="w-100" />
                    </Card.Header>
                    <Card.Body>
                        <Card.Title as="p">
                            <strong>
                                { book.title }
                            </strong>
                        </Card.Title>
                                   
                        <Link to={`/book/${book.bookId}/`}
                            className="btn btn-sm btn-primary btn-block">
                            Click to open
                        </Link>
                    </Card.Body>
                </Card>
            </Col>
        );
    }

    private showBooks() {
        if (this.state.books?.length === 0) {
            return(
                <div>
                    There are no books to show.
                </div>
            );
        }

        return (
            <Row>
                { this.state.books?.map(this.singleBook) }
            </Row>
        );
    }

    private getCategoryData() {
        api('api/category/' + this.props.match.params.cId, 'get', {})
        .then((res: ApiResponse) => {
            if (res.status === 'login') {
				return this.setLoggedInState(false);				
            }
            
            if (res.status === 'error') {
                return this.setMessage('Please wait...or try to refresh');
            }

            const categoryData: CategoryType = {
                categoryId: res.data.categoryId,
                name: res.data.name,
            };

            this.setCategoryData(categoryData);
        });

        const orderParts = this.state.filters.order.split(' ');
        const orderBy = orderParts[0];
        const orderDirection = orderParts[1].toUpperCase();

        api('api/book/search/', 'post', {
            categoryId: Number(this.props.match.params.cId),            
            keywords: this.state.filters?.keywords,
            title: this.state.filters?.title,            
            authors:[],
            publicationYear: 0,
            orderBy: orderBy,
            orderDirection: orderDirection, 
            page: 0,
            itemsPerPage: 10
        })
        .then((res: ApiResponse) => {
            
            if (res.status === 'login') {
                return this.setLoggedInState(false);
            }

            if (res.status === 'error') {
                return this.setMessage('Request Error');
            }

            if (res.data.statusCode === 0) {
                this.setBooks([]);
                this.setMessage('');
                return;
            }
                const books: BookType[] = res.data.map((book: BookDto) => {

                    const object: BookType = {
                        bookId: book.bookId,
                        title: book.title,
                        originalTitle: book.originalTitle,
                        publicationYear: book.publicationYear,
                        pages: book.pages,
                        isbn: book.isbn,
                        language: book.language,
                        catalogNumber: book.catalogNumber,
                        imageBack: '',
                        imageFront: ''                   
                        
                    }                   
                    
                    if (book.photos && book.photos.length > 0) {
                        for (let i = 0; i < book.photos.length; i++)
                            if (book.photos[i].cover === 'front') {
                                object.imageFront = book.photos[i].imagePath;
                            } else {
                                object.imageBack = book.photos[i].imagePath;
                            }                           
                    }

                    return object;
                })
                
                this.setBooks(books);    

            
            //console.log(books);
            


            /*
            const books: BookType[] = 
            res.data.map((book: BookDto) => {
                
                const object: BookType = {
                    bookId: book.bookId,
                    title: book.title,
                    originalTitle: book.originalTitle,
                    publicationYear: book.publicationYear,
                    pages: book.pages,
                    isbn: book.isbn,
                    language: book.language,
                    catalogNumber: book.catalogNumber,
                    imageUrlFront: String(book.photos[0]),
                    imageUrlBack: String(book.photos[1]),                    
                }    
                
                return object;
                
            }

            this.setBooks(books);*/
        })
    }
}
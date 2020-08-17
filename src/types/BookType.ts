export default class BookType {
    bookId?: number;
    title?: string;
    originalTitle?: string;
    publicationYear?: number;
    pages?: number;
    isbn?: string;
    isVisible?: number;
    language?: string;    
    catalogNumber?: string;
    publisherId?: number;    
    imageFront?: string;
    imageBack?: string;
    location?: {
        room: string;
        shelf: string;
    };
    category?: {
        categoryId: number;
        name: string;
    };
    authors?: {
        authorId: number;
        forename: string;
        surname: string;
    }[];
    photos?: {
        photoId: number;
        imagePath: string;
    }[];
    categoryBook?: {
        name: string;
    };
    publisher?: {
        name: string;
    }
    
}

// kako front-end vidi jedan primerak knjige
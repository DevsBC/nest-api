import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
export declare class BookmarkController {
    private bookmarkService;
    constructor(bookmarkService: BookmarkService);
    getAll(userId: number): import(".prisma/client").PrismaPromise<import(".prisma/client").Bookmark[]>;
    get(userId: number, bookmarkId: number): import(".prisma/client").Prisma.Prisma__BookmarkClient<import(".prisma/client").Bookmark>;
    create(userId: number, dto: CreateBookmarkDto): Promise<import(".prisma/client").Bookmark>;
    edit(userId: number, bookmarkId: number, dto: EditBookmarkDto): Promise<import(".prisma/client").Bookmark>;
    delete(userId: number, bookmarkId: number): Promise<void>;
}

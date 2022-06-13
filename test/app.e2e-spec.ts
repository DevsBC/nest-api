import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

describe('app e2e', () => {
  const port = 3333;
  const server = `http://localhost:${port}`;
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.listen(port);

    prisma = app.get(PrismaService);

    const cleanDb = () =>
      prisma.$transaction([
        prisma.bookmark.deleteMany(),
        prisma.user.deleteMany(),
      ]);
    await cleanDb();
    pactum.request.setBaseUrl(server);
  });

  afterAll(() => app.close());

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'juancarlos.aranda@gmail.com',
      password: '123',
    };
    describe('Sign Up', () => {
      it('throw an error if email does not exist', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });
      it('throw an error if password does not exist', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });
      it('throw an error if body empty', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
      it('should sign up', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Sign In', () => {
      it('throw an error if email does not exist', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });
      it('throw an error if password does not exist', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });
      it('throw an error if body empty', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });
      it('should sign in', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(201)
          .stores('token', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get Me', () => {
      it('get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(200);
      });
    });
    describe('Edit User', () => {
      it('edit an user', () => {
        const dto: EditUserDto = {
          email: 'email@gmail.com',
          firstName: 'Email',
        };
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .withBody(dto)
          .expectStatus(200);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get Empty Bookmarks', () => {
      it('get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });
    describe('Create Bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'First Bookmark',
        link: 'https://nodoapp.web.app',
      };
      it('should create a new bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });
    describe('Get Bookmarks', () => {
      it('should get bookmarks saved', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });
    describe('Get Bookmark By Id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });
    describe('Edit Bookmark By Id', () => {
      const dto: EditBookmarkDto = {
        description: 'Add a description',
      };
      it('should edit a bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.description);
      });
    });
    describe('Delete Bookmark By Id', () => {
      it('should delete a bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(204);
      });
      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});

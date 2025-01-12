
export interface IPost {
  id: number;
  text: string;
  userId: number;
}

export class Post implements IPost {
  id: number;
  text: string;
  userId: number;

  constructor(userId: number, text: string) {
    this.id = 1;
    this.text = text;
    this.userId = userId;
  }
}

abstract class PostRepository {
  abstract getPost(id: number): IPost
  abstract getPosts(): IPost[]
  abstract createPost(data: IPost): void
  abstract updatePost(id: number, data: IPost): void
  abstract deletePost(id: number): void
}

export class InMemoryPostRepository extends PostRepository {
  private posts: IPost[];

  constructor() {
    super();
    this.posts = []
  }

  getPosts(): IPost[] {
    return this.posts;
  }
  getPost(id: number): IPost {
    let post = this.posts.find(p => p.id == id);
    return post as IPost;
  }
  createPost(data: IPost): void {
    let post = new Post(data.userId, data.text);
    this.posts.push(post);
  }
  updatePost(id: number, data: IPost): void {
    let post = this.posts.find(p => p.id == id);
    if (post) {
      post.text = data.text;
    }
  }
  deletePost(id: number): void {
    let postIndex = this.posts.findIndex(p => p.id == id);
    if (postIndex >= 0) {
      this.posts.splice(postIndex, 1);
      // delete this.posts[postIndex]
      // this.posts.toSpliced(postIndex, 1)
    }
  }
}

// class SQLitePostRepository extends PostRepository {
//   posts: List<IPost>;

//   constructor() {
//     super();
//     this.posts = new List<Post>()
//   }

//   getPost(id: number): void {

//   }
// }

// function main() {
//   const postRepo = new InMemoryPostRepository();
//   postRepo.createPost(new Post(1, "Hello World"))
//   let posts = postRepo.getPosts()
//   console.log(posts)
//   let post = postRepo.getPost(posts[0].id)
//   console.log(post)
//   post.text = "Hello World!"
//   let updatedPost = postRepo.updatePost(posts[0].id, post)
//   console.log(updatedPost)
//   postRepo.deletePost(posts[0].id) 
//   console.log(postRepo.getPosts())
// }
// main()

// interface Point {
//   x: number;
//   y: number;
// }

// let pointPart: Partial<Point> = {}; // `Partial` allows x and y to be optional
// pointPart.x = 10;


// interface Car {
//   make: string;
//   model: string;
//   mileage?: number;
// }

// let myCar: Required<Car> = {
//   make: 'Ford',
//   model: 'Focus',
//   mileage: 12000 // `Required` forces mileage to be defined
// };

// const nameAgeMap: Record<string, number> = {
//   'Alice': 21,
//   'Bob': 25
// };

// interface Person {
//   name: string;
//   age: number;
//   location?: string;
// }

// const bob: Omit<Person, 'age' | 'location'> = {
//   name: 'Bob'
//   // `Omit` has removed age and location from the type and they can't be defined here
// };

// interface Person {
//   name: string;
//   age: number;
//   location?: string;
// }

// const bob: Pick<Person, 'name'> = {
//   name: 'Bob'
//   // `Pick` has only kept name, so age and location were removed from the type and they can't be defined here
// };

// type Primitive = string | number | boolean
// const value: Exclude<Primitive, string> = true; // a string cannot be used here since Exclude removed it from the type.

// type PointGenerator = () => { x: number; y: number; };
// const point: ReturnType<PointGenerator> = {
//   x: 10,
//   y: 20
// };

// type PointPrinter = (p: { x: number; y: number; }) => void;
// const point: Parameters<PointPrinter>[0] = {
//   x: 10,
//   y: 20
// };


// interface Person {
//   name: string;
//   age: number;
// }
// const person: Readonly<Person> = {
//   name: "Dylan",
//   age: 35,
// };
// person.name = 'Israel'; // prog.ts(11,8): error TS2540: Cannot assign to 'name' because it is a read-only property.

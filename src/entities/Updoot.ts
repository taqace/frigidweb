
import { BaseEntity,Column,Entity, ManyToOne, PrimaryColumn} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

// many to many relationship
// user <--> posts
// user -> join table <- posts
// join table is updoot


@Entity()
export class Updoot extends BaseEntity{


    @Column({ type: "int"})
    value: number
    

    @PrimaryColumn()
    userID: number;

    @ManyToOne(() => User, (user) => user.updoots)
    user: User;

    @PrimaryColumn()
    postId: number;

    @ManyToOne(() => Post, (post) => post.updoots)
    post: Post;

};


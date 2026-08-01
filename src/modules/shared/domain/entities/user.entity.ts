export class UserEntity {
  id?: string;
  username: string;
  email: string;
  isActive: boolean;

  constructor(props: {
    id?: string;
    username: string;
    email: string;
    isActive?: boolean;
  }) {
    this.id = props.id;
    this.username = props.username;
    this.email = props.email;
    this.isActive = props.isActive ?? true;
  }
}

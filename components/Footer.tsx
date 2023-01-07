import { NextPage } from "next";

type FooterProps = {
    togglModal():void
}

export const Footer: NextPage<FooterProps> = ({togglModal}) => {
    return (
        <div className="container-footer">
            <span>© Copyright {new Date().getFullYear()}. Todos os direitos reservados.</span>
            <button onClick={togglModal}><img src="/add.svg" alt="Adicionar tarefa"/>Adicionar uma tarefa</button>
        </div>
    );
}
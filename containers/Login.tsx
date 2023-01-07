import { NextPage } from "next";
import { useEffect, useState } from 'react';
import { executeRequest } from "../services/api";

type LoginProps = {
    setToken(s: string): void
}

export const Login: NextPage<LoginProps> = ({ setToken }) => {

    const [name, setName] = useState('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);

    const validateForm = () => {
        return (!login || !password || (!isLogin && !name));
    }

    const doLogin = async () => {
        try {
            setErrorMsg('');
            const formIsValid = validateForm();
            if (formIsValid) {
                return setErrorMsg('Favor preencher os campos');
            }

            setLoading(true);

            const body = {
                login,
                password
            }

            const result = await executeRequest('login', 'POST', body);
            if (result && result.data) {
                const obj = result.data;
                localStorage.setItem('accessToken', obj.token);
                localStorage.setItem('name', obj.name);
                localStorage.setItem('email', obj.email);
                setToken(obj.token);
            }
        } catch (e: any) {
            console.log('Ocorreu erro ao efetuar login:', e);
            if (e?.response?.data?.error) {
                setErrorMsg(e?.response?.data?.error);
            } else {
                setErrorMsg('Ocorreu erro ao efetuar login');
            }
        }

        setLoading(false);
    }

    const doSignup = async () => {
        try {
            setErrorMsg('');

            const formIsValid = validateForm();
            if (formIsValid) {
                return setErrorMsg('Favor preencher os campos');
            }

            setLoading(true);

            const body = {
                name,
                email: login,
                password
            }

            const result = await executeRequest('register', 'POST', body);
            if (result && result.data) {
                setIsLogin(true);
                setSuccessMsg('Cadastro realizado com sucesso!');
                setErrorMsg('');
            }
        } catch (e: any) {
            console.log('Ocorreu erro ao efetuar o cadastro:', e);
            if (e?.response?.data?.error) {
                setErrorMsg(e?.response?.data?.error);
            } else {
                setErrorMsg('Ocorreu erro ao efetuar o cadastro');
            }
        }

        setLoading(false);
    }

    const renderConfirmButton = () => {

        let label = '';

        if(loading) {
            label = '...Carregando';
        } else if (isLogin) {
            label = 'Login';
        } else {
            label = 'Cadastrar';
        }

        return <button onClick={isLogin ? doLogin : doSignup} disabled={loading}>{label}</button>
    }

    useEffect(() => {
        setLogin('');
        setPassword('');
        setName('');
        setErrorMsg('');
        if (!isLogin) setSuccessMsg('');
    }, [isLogin]);

    return (
        <div className="container-login">
            <img src="/logo.svg" alt="Logo Fiap" className="logo" />
            <div className="form">
                {errorMsg && <p className="errorMsg">{errorMsg}</p>}
                {successMsg && <p className="successMsg">{successMsg}</p>}

                {!isLogin &&
                    <div>
                        <img src="/person.svg" alt="Nome" />
                        <input type='text' placeholder="Nome"
                            value={name} onChange={event => setName(event.target.value)}
                        />
                    </div>
                }

                <div>
                    <img src="/mail.svg" alt="Login" />
                    <input type='text' placeholder="Login"
                        value={login} onChange={event => setLogin(event.target.value)}
                    />
                </div>

                <div>
                    <img src="/lock.svg" alt="Senha" />
                    <input type='password' placeholder="Senha"
                        value={password} onChange={event => setPassword(event.target.value)}
                    />
                </div>

                {renderConfirmButton()}

                <div className="signupButton">
                    <p onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Criar uma conta' : 'Já tenho conta'}</p>
                </div>

            </div>
        </div>
    );
}
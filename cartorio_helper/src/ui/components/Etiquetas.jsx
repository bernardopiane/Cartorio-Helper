import { InputMask } from 'primereact/inputmask';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { Card } from 'primereact/card';
import React from 'react';
import styles from './Etiquetas.module.css';


function Etiquetas() {
    const [cpf1, setCpf1] = React.useState('');
    const [nome1, setNome1] = React.useState('');
    const [cpf2, setCpf2] = React.useState('');
    const [nome2, setNome2] = React.useState('');
    const [motivo, setMotivo] = React.useState('');
    const [naoAverbacao, setNaoAverbacao] = React.useState(false);
    // Data atual no formato dd de mês de yyyy
    const [data, setData] = React.useState(new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }));

    // Função para gerar o template com os valores atuais
    const generateTemplate = () => {
        if (naoAverbacao) {
            let template = `Não foi possível averbar o CPF do(a) registrado(a), pois ${motivo}`;
            return template;
        } else {
            let template = `Averbo, nos termos do Art. 6º do Provimento 63 de 14/11/2017 do Conselho Nacional de Justiça, para que passe a constar do registro, que o número do CPF de ${nome1} é ${cpf1}`;

            if (cpf2 && nome2) {
                template += ` e que o número do CPF de ${nome2} é ${cpf2}`;
            }

            template += `, tudo conforme comprovantes da Receita Federal, obtido através de consulta feita na base dados do CRC Nacional. Dou fé, Nova Friburgo, ${data}.`;
            return template;
        }
    };

    const [inputText, setInputText] = React.useState(generateTemplate());

    React.useEffect(() => {
        setInputText(generateTemplate());
    }, [nome1, cpf1, nome2, cpf2, data, motivo, naoAverbacao]);

    return (
        <div className={styles.etiquetasContainer}>
            <Card title="Gerador de Etiquetas">
                <div className={styles.inputsContainer}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="cpf1">CPF 1:</label>
                        <InputMask
                            type="text"
                            id="cpf1"
                            name="type"
                            value={cpf1}
                            onChange={(e) => {
                                setCpf1(e.target.value);
                                setInputText(generateTemplate());
                            }}
                            placeholder="000.000.000-00"
                            mask="999.999.999-99"
                            className={styles.inputField}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="nome1">Nome 1:</label>
                        <InputText
                            type="text"
                            id="nome1"
                            name="type"
                            value={nome1}
                            onChange={(e) => {
                                setNome1(e.target.value);
                                setInputText(generateTemplate());
                            }}
                            placeholder="Nome completo"
                            className={styles.inputField}
                        />
                    </div>
                </div>
                <div className={styles.inputsContainer}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="cpf2">CPF 2:</label>
                        <InputMask
                            type="text"
                            id="cpf2"
                            name="type"
                            value={cpf2}
                            onChange={(e) => {
                                setCpf2(e.target.value);
                                setInputText(generateTemplate());
                            }}
                            placeholder="000.000.000-00"
                            mask="999.999.999-99"
                            className={styles.inputField}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="nome2">Nome 2:</label>
                        <InputText
                            type="text"
                            id="nome2"
                            name="type"
                            value={nome2}
                            onChange={(e) => {
                                setNome2(e.target.value);
                                setInputText(generateTemplate());
                            }}
                            placeholder="Nome completo"
                            className={styles.inputField}
                        />
                    </div>
                </div>

                <div className={styles.templateContainer}>
                    <label htmlFor="template">Template:</label>
                    <InputTextarea
                        id="template"
                        name="type"
                        rows="10"
                        cols="50"
                        value={inputText}
                        onChange={(e) => {
                            setInputText(e.target.value);
                        }}
                        placeholder="Texto da etiqueta"
                        className={styles.templateField}
                    />
                </div>

                {/* Caso não seja possivel pegar o CPF, Mostrar o texto como o template de não averbação e espaço para motivo */}
                <div className={styles.inputsContainer}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="naoAverbacao">Caso não seja possivel averbar o CPF, marque a opção abaixo e informe o motivo:</label>
                        <Checkbox
                            id="naoAverbacao"
                            name="naoAverbacao"
                            value={naoAverbacao}
                            checked={naoAverbacao}
                            onChange={(e) => {
                                setNaoAverbacao(!e.value);
                            }}
                        />
                        <label htmlFor="motivo">Motivo:</label>
                        <InputText
                            type="text"
                            id="motivo"
                            name="type"
                            value={motivo}
                            disabled={!naoAverbacao}
                            onChange={(e) => {
                                setMotivo(e.target.value);
                                setInputText(generateTemplateNaoAverbacao());
                            }}
                            placeholder="Motivo"
                            className={styles.inputField}
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default Etiquetas;

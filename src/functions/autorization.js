import sql from './sql.js'
import tables from '../utils/tables.js'

async function getPermission(authorization, company_id) {
    if (!authorization) {
        throw new Error('Autorização não fornecida');
    };

    const token_authorization = authorization.replace('Bearer ', '');

    const getTokenResult = await sql.SELECT(tables.cad_users_permissions.schema,
        {
            [tables.cad_users_permissions.columns.token]: token_authorization,
            [tables.cad_users_permissions.columns.enabled]: true,
            [tables.cad_users_permissions.columns.company_id]: company_id,
        })
        // .then(result => console.log(result))
        .catch(error => console.error(error));

    if (!getTokenResult || getTokenResult.length === 0) {
        throw new Error('Não autorizado');
    }

    return getTokenResult;
};

async function verifyToken(authorization, company_id) {
    try {
        return await getPermission(authorization, company_id);
    } catch (error) {
        return { error: error.message };
    }
};

export default { verifyToken };
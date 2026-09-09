package gordo.peluche.IService;

import java.util.List;
import gordo.peluche.Entidades.Compra;

public interface CompraIService {
    public List<Compra> findAllCompras();
    public Compra saveCompra(Compra compra);
}
